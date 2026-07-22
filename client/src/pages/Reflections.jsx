import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reflectionApi } from '../api/reflectionApi';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Heart, Save, Calendar as CalendarIcon, Sparkles, Star } from 'lucide-react';

const Reflections = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatCouldBeBetter, setWhatCouldBeBetter] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [rating, setRating] = useState(4);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current selected reflection
  const { data: currentData, isLoading: isCurrentLoading } = useQuery({
    queryKey: ['reflection', selectedDate],
    queryFn: () => reflectionApi.getReflections({ date: selectedDate })
  });

  // Fetch reflection history list
  const { data: historyData } = useQuery({
    queryKey: ['reflections', 'history'],
    queryFn: () => reflectionApi.getReflections()
  });

  useEffect(() => {
    if (currentData?.reflection) {
      const r = currentData.reflection;
      setWhatWentWell(r.whatWentWell || '');
      setWhatCouldBeBetter(r.whatCouldBeBetter || '');
      setGratitude(r.gratitude || '');
      setRating(r.rating || 4);
    } else {
      setWhatWentWell('');
      setWhatCouldBeBetter('');
      setGratitude('');
      setRating(4);
    }
  }, [currentData, selectedDate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await reflectionApi.saveReflection({
        date: selectedDate,
        whatWentWell,
        whatCouldBeBetter,
        gratitude,
        rating
      });
      queryClient.invalidateQueries({ queryKey: ['reflection', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['reflections', 'history'] });
      showSuccess('Reflection saved! 💖');
    } catch (err) {
      showError(err.message || 'Failed to save reflection');
    } finally {
      setIsSaving(false);
    }
  };

  const reflectionsList = historyData?.reflections || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Reflections"
        subtitle="Pause, reflect on your wins, learn from challenges, and cultivate gratitude"
        icon={Heart}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Journal Form (2 Cols on Desktop) */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-planner-border">
            <div>
              <h2 className="text-lg font-bold text-planner-text">Daily Journal Entry</h2>
              <p className="text-xs text-planner-muted">One reflection per date</p>
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              containerClassName="max-w-xs"
            />
          </div>

          {isCurrentLoading ? (
            <LoadingSpinner message="Loading entry..." />
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              {/* Rating Selector */}
              <div>
                <label className="text-xs font-semibold text-planner-muted uppercase tracking-wider block mb-2">
                  Rate Your Day
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-2xl border transition-all ${
                        rating >= star
                          ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 text-amber-500 scale-110 shadow-xs'
                          : 'bg-planner-bg/60 border-planner-border text-planner-muted opacity-40'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                label="🌸 What went well today?"
                placeholder="Highlight your wins, accomplishments, or moments of joy..."
                rows={3}
                value={whatWentWell}
                onChange={(e) => setWhatWentWell(e.target.value)}
              />

              <Textarea
                label="🌿 What could be better?"
                placeholder="What challenges did you face? What did you learn?"
                rows={3}
                value={whatCouldBeBetter}
                onChange={(e) => setWhatCouldBeBetter(e.target.value)}
              />

              <Textarea
                label="💖 What am I grateful for?"
                placeholder="List 1-3 things or people you feel thankful for..."
                rows={3}
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" isLoading={isSaving} size="lg">
                  Save Reflection <Save className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Reflection History Sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-planner-border">
              <h3 className="font-bold text-planner-text text-base">Past Entries</h3>
              <Sparkles className="w-4 h-4 text-planner-primary" />
            </div>

            {reflectionsList.length === 0 ? (
              <p className="text-xs text-planner-muted text-center py-6 bg-planner-bg/40 rounded-2xl">
                No past reflections found yet.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {reflectionsList.map((ref) => (
                  <button
                    key={ref._id}
                    onClick={() => setSelectedDate(ref.date)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      selectedDate === ref.date
                        ? 'border-planner-primary bg-planner-secondary shadow-xs'
                        : 'border-planner-border bg-planner-bg/60 hover:bg-planner-secondary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-planner-text">📅 {ref.date}</span>
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <Star className="w-3 h-3 fill-current mr-0.5" /> {ref.rating}/5
                      </div>
                    </div>
                    {ref.gratitude && (
                      <p className="text-xs text-planner-muted truncate italic">
                        "{ref.gratitude}"
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reflections;
