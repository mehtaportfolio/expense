import { useState, useEffect } from 'react';
import { MilkDetail } from '../types/database';
import { Button } from './Button';
import { Input } from './Input';
import { getApiUrl } from '../lib/api';

interface MilkTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'view' | 'edit' | null;
  onRequirePassword?: () => void;
}

export function MilkTrackingModal({ isOpen, onClose, mode, onRequirePassword }: MilkTrackingModalProps) {
  const [milkDetails, setMilkDetails] = useState<MilkDetail[]>([]);
  const [rate, setRate] = useState<number>(45);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [fillValue, setFillValue] = useState<string>('0.5');

  const getAuthHeaders = () => {
    const password = sessionStorage.getItem('auth_password');
    return password ? { 'X-Auth-Password': password } : {};
  };

  const fetchMilkDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/milk'));
      if (!response.ok) {
        throw new Error('Failed to fetch milk details');
      }
      const data = await response.json();
      setMilkDetails(data || []);
    } catch (error) {
      console.error('Error fetching milk details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMilkDetails();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset editing state when switching to view mode
  useEffect(() => {
    if (mode === 'view') {
      setEditingRow(null);
      setEditValue('');
    }
  }, [mode]);

  const handleEdit = (sr_no: number, currentKg: number) => {
    setEditingRow(sr_no);
    setEditValue(currentKg.toString());
  };

  const handleSave = async () => {
    if (editingRow === null) return;

    try {
      const newKg = parseFloat(editValue);
      if (isNaN(newKg)) return;

      const response = await fetch(getApiUrl(`/api/milk/${editingRow}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ kg: newKg }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Failed to update milk detail: ${response.status} ${errText}`);
      }

      setEditingRow(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating milk detail:', error);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditValue('');
  };

const handleFillValues = async () => {
  try {
    const valueToFill = parseFloat(fillValue);

    if (isNaN(valueToFill)) {
      alert('Please enter a valid number');
      return;
    }

    const response = await fetch(getApiUrl('/api/milk/fill-zero'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ kg: valueToFill }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Failed to fill values: ${response.status} ${errText}`);
    }

    // 🔥 IMPORTANT: re-fetch from DB
    setLoading(true);
await fetchMilkDetails();
setLoading(false);

  } catch (error) {
    console.error('Error filling values:', error);
  }
};

  const totalKg = milkDetails.reduce((sum, item) => sum + item.kg, 0);
  const totalAmount = totalKg * rate;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-primary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-primary px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Milk Tracking</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={fillValue}
                onChange={(e) => setFillValue(e.target.value)}
                className="w-20 h-8 text-sm px-2 bg-secondary border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-primary"
                placeholder="kg"
              />
              <Button
                onClick={handleFillValues}
                variant="primary"
                size="sm"
              >
                Fill
              </Button>
            </div>
            <button onClick={onClose} className="text-tertiary hover:text-primary transition-colors" aria-label="Close modal">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Card */}
          <div className="bg-secondary/50 border border-primary rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="md:w-1/3">
                <Input
                  label="Rate (per kg)"
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full"
                  disabled={mode === 'view'}
                />
              </div>
              <div className="flex gap-6 md:justify-end">
                <div className="text-center">
                  <p className="text-sm text-secondary">Total KG</p>
                  <p className="text-xl font-semibold text-primary">{totalKg.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-secondary">Total Amount</p>
                  <p className="text-xl font-semibold text-primary">₹{totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Milk Details Table */}
          <div className="mb-4 text-sm text-secondary">
            Showing {milkDetails.length} milk entries
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-secondary">Loading milk details...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-primary">
                <thead>
                  <tr className="bg-secondary">
                    <th className="border border-primary px-4 py-2 text-left text-sm font-medium">Sr No</th>
                    <th className="border border-primary px-4 py-2 text-left text-sm font-medium">KG</th>
                    <th className="border border-primary px-4 py-2 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {milkDetails.map((detail) => (
                    <tr key={detail.sr_no} className="hover:bg-secondary/50">
                      <td className="border border-primary px-4 py-2 text-sm">{detail.sr_no}</td>
                      <td className="border border-primary px-4 py-2">
                        {editingRow === detail.sr_no ? (
                          <Input
                            label="KG"
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm">{detail.kg.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="border border-primary px-4 py-2">
                        {editingRow === detail.sr_no ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSave}
                              variant="primary"
                              size="sm"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={handleCancel}
                              variant="secondary"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleEdit(detail.sr_no, detail.kg)}
                            variant="secondary"
                            size="sm"
                          >
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
