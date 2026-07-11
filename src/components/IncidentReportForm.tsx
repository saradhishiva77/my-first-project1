import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, CheckCircle2, Camera, X } from 'lucide-react';
import { createIncidentReport } from '../lib/disasterFeed';
import { useAuth } from '../context/AuthContext';

const DISASTER_TYPES = [
  { value: 'flood', label: 'Flood' },
  { value: 'cyclone', label: 'Cyclone' },
  { value: 'earthquake', label: 'Earthquake' },
  { value: 'landslide', label: 'Landslide' },
  { value: 'heatwave', label: 'Heatwave' },
  { value: 'wildfire', label: 'Wildfire' },
  { value: 'other', label: 'Other' },
];

const SEVERITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export function IncidentReportForm({ onClose, onSubmitted }: { onClose: () => void; onSubmitted?: () => void }) {
  const { session } = useAuth();
  const [disasterType, setDisasterType] = useState('flood');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationName, setLocationName] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(4));
        setLongitude(pos.coords.longitude.toFixed(4));
      },
      () => setError('Could not get your location. Please enter coordinates manually.')
    );
  }

  async function handleSubmit() {
    if (!session) {
      setError('Please sign in to submit a report.');
      return;
    }
    if (!description.trim() || !latitude || !longitude) {
      setError('Description and location are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await createIncidentReport({
      disaster_type: disasterType,
      description: description.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      location_name: locationName.trim() || null,
      severity,
      photo_url: photoUrl.trim() || null,
    });
    setSubmitting(false);
    if (result) {
      setSuccess(true);
      onSubmitted?.();
      setTimeout(() => onClose(), 1500);
    } else {
      setError('Failed to submit report. Please try again.');
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-xl text-white">Report Incident</h2>
              <p className="text-sm text-slate-400 mt-0.5">Share a local disaster sighting with the community</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          {success ? (
            <div className="flex flex-col items-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
              <p className="font-display font-semibold text-white">Report Submitted</p>
              <p className="text-sm text-slate-400 mt-1">Your incident has been shared with the community.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Disaster Type</label>
                  <select className="input" value={disasterType} onChange={(e) => setDisasterType(e.target.value)}>
                    {DISASTER_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Severity</label>
                  <select className="input" value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)}>
                    {SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  placeholder="Describe what you're seeing..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Location Name (optional)</label>
                <input
                  className="input"
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Latitude</label>
                  <input className="input" type="number" step="0.0001" placeholder="e.g. 19.0760" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input className="input" type="number" step="0.0001" placeholder="e.g. 72.8777" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                </div>
              </div>

              <button onClick={getLocation} className="btn-outline text-sm w-full">
                <MapPin className="w-4 h-4" /> Use My Current Location
              </button>

              <div>
                <label className="label">Photo URL (optional)</label>
                <input className="input" placeholder="https://..." value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
