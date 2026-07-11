import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Activity,
  Download,
  Trash2,
  Brain,
  Calendar,
  MapPin,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Card, Badge, EmptyState } from '../components/ui';
import { supabase, type PredictionRow } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function HistoryPage() {
  const { session } = useAuth();
  const [rows, setRows] = useState<PredictionRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!session) return;
    setLoading(true);
    const { data } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    setRows((data as PredictionRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [session]);

  async function remove(id: string) {
    await supabase.from('predictions').delete().eq('id', id);
    load();
  }

  function download(row: PredictionRow) {
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    doc.setFillColor(7, 11, 20);
    doc.rect(0, 0, w, 30, 'F');
    doc.setTextColor(6, 182, 212);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('DisasterAI — Risk Prediction Report', 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date(row.created_at).toLocaleString()}`, 14, 24);

    let y = 42;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Prediction Summary', 14, y); y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`State: ${row.state}`, 14, y); y += 6;
    doc.text(`District: ${row.district ?? '-'}`, 14, y); y += 6;
    doc.text(`Risk Level: ${row.risk_level}`, 14, y); y += 6;
    doc.text(`Confidence: ${row.confidence_score}%`, 14, y); y += 6;
    doc.text(`Affected Population: ${row.affected_population?.toLocaleString() ?? '-'}`, 14, y); y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Recommendations', 14, y); y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    row.recommendations.forEach((r, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${r}`, w - 28);
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    doc.save(`report-${row.state}-${row.id.slice(0, 8)}.pdf`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">My Predictions</h1>
          <p className="text-sm text-slate-400 mt-1">
            Your saved risk predictions and downloadable reports
          </p>
        </div>
        <Link to="/predict" className="btn-primary text-sm">
          <Brain className="w-4 h-4" /> New Prediction
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28" />)}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Activity}
            title="No predictions yet"
            message="Run a prediction from the Predict Risk page and save it to see it here."
            action={<Link to="/predict" className="btn-primary"><Brain className="w-4 h-4" /> Make a Prediction</Link>}
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rows.map((r, i) => {
            const color = r.risk_level === 'Critical' ? 'red' : r.risk_level === 'High' ? 'orange' : r.risk_level === 'Medium' ? 'amber' : 'green';
            const topRisk = (r.results as any)?.risks?.[0];
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="p-5 glass-hover">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
                        <MapPin className="w-4.5 h-4.5 text-accent-400" />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-white">{r.state}</p>
                        <p className="text-xs text-slate-500">{r.district ?? '—'}</p>
                      </div>
                    </div>
                    <Badge color={color as 'red' | 'orange' | 'amber' | 'green'}>{r.risk_level}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="p-2.5 rounded-lg bg-white/5 text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Risk</p>
                      <p className="text-sm font-display font-bold text-white">
                        {topRisk ? `${topRisk.probability.toFixed(0)}%` : '—'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
                      <p className="text-sm font-display font-bold text-white">{r.confidence_score}%</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Affected</p>
                      <p className="text-sm font-display font-bold text-white">
                        {r.affected_population ? `${(r.affected_population / 1_000_000).toFixed(2)}M` : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(r.created_at).toLocaleString()}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => download(r)} className="btn-outline flex-1 text-xs py-2">
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 inline-flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
