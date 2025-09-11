import { useState, useEffect } from 'react';
import { usePageTitle } from '../components/layout/Breadcrumbs';
import { verseService } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { MotivationalVerse } from '../types';
import { 
  BookOpenIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface VerseFormData {
  surah_name: string;
  surah_name_ar: string;
  surah_number: number;
  ayah_number: number;
  arabic_text: string;
  translation: string;
  is_active: boolean;
}

export function Verses() {
  usePageTitle();

  const [verses, setVerses] = useState<MotivationalVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVerse, setEditingVerse] = useState<MotivationalVerse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<VerseFormData>({
    surah_name: '',
    surah_name_ar: '',
    surah_number: 1,
    ayah_number: 1,
    arabic_text: '',
    translation: '',
    is_active: true,
  });

  const fetchVerses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await verseService.getVerses();
      
      if (response.ok && response.data) {
        setVerses(response.data);
      } else {
        setError(response.error || 'Failed to fetch verses');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation to avoid 422s
    if (!formData.arabic_text || formData.arabic_text.trim().length === 0) {
      setError('Arabic text is required');
      return;
    }
    if (formData.surah_number < 1 || formData.surah_number > 114) {
      setError('Surah number must be between 1 and 114');
      return;
    }
    if (formData.ayah_number < 1) {
      setError('Ayah number must be at least 1');
      return;
    }
    
    try {
      setError(null);
      setSubmitting(true);
      
      let response;
      if (editingVerse) {
        response = await verseService.updateVerse(editingVerse.id, formData);
      } else {
        response = await verseService.createVerse(formData);
      }
      
      if (response.ok) {
        setShowForm(false);
        setEditingVerse(null);
        resetForm();
        fetchVerses();
      } else {
        setError(response.error || 'Failed to save verse');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (verse: MotivationalVerse) => {
    setEditingVerse(verse);
    setFormData({
      surah_name: verse.surah_name || '',
      surah_name_ar: verse.surah_name_ar || '',
      surah_number: verse.surah_number || 1,
      ayah_number: verse.ayah_number || 1,
      arabic_text: verse.arabic_text || '',
      translation: verse.translation || '',
      is_active: verse.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (verseId: number) => {
    if (!confirm('Are you sure you want to delete this verse? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await verseService.deleteVerse(verseId);
      if (response.ok) {
        fetchVerses();
      } else {
        setError(response.error || 'Failed to delete verse');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleToggleStatus = async (verseId: number) => {
    try {
      const response = await verseService.toggleVerse(verseId);
      if (response.ok) {
        fetchVerses();
      } else {
        setError(response.error || 'Failed to toggle verse status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Toggle failed');
    }
  };

  const resetForm = () => {
    setFormData({
      surah_name: '',
      surah_name_ar: '',
      surah_number: 1,
      ayah_number: 1,
      arabic_text: '',
      translation: '',
      is_active: true,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVerse(null);
    resetForm();
  };

  const filteredVerses = verses.filter(verse => {
    const term = searchTerm.trim().toLowerCase();
    const numericMatch = term && !isNaN(Number(term))
      ? (String(verse.surah_number || '').includes(term) || String(verse.ayah_number || '').includes(term))
      : false;

    const matchesSearch = !term || 
      verse.surah_name?.toLowerCase().includes(term) ||
      verse.translation?.toLowerCase().includes(term) ||
      verse.arabic_text?.includes(searchTerm) ||
      numericMatch;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && verse.is_active) ||
      (statusFilter === 'inactive' && !verse.is_active);
    
    return matchesSearch && matchesStatus;
  });

  if (loading && verses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Motivational Verses</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage Islamic verses and inspirational content for your app.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Verse
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search verses by Surah name, translation, or Arabic text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {editingVerse ? 'Edit Verse' : 'Add New Verse'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surah Name (English)
                </label>
                <input
                  type="text"
                  value={formData.surah_name}
                  onChange={(e) => setFormData({...formData, surah_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Al-Fatiha"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surah Name (Arabic)
                </label>
                <input
                  type="text"
                  value={formData.surah_name_ar}
                  onChange={(e) => setFormData({...formData, surah_name_ar: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., الفاتحة"
                  dir="rtl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surah Number
                </label>
                <input
                  type="number"
                  min="1"
                  max="114"
                  value={formData.surah_number}
                  onChange={(e) => setFormData({...formData, surah_number: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ayah Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.ayah_number}
                  onChange={(e) => setFormData({...formData, ayah_number: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arabic Text
              </label>
              <textarea
                value={formData.arabic_text}
                onChange={(e) => setFormData({...formData, arabic_text: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the Arabic text of the verse"
                dir="rtl"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Translation
              </label>
              <textarea
                value={formData.translation}
                onChange={(e) => setFormData({...formData, translation: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the English translation"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active (verse will be shown to users)
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:ring-2 focus:ring-blue-500`}
              >
                {submitting ? (editingVerse ? 'Updating...' : 'Saving...') : (editingVerse ? 'Update Verse' : 'Add Verse')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Verses List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Verses ({filteredVerses.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredVerses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No verses found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Start by adding your first motivational verse.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredVerses.map((verse) => (
              <div key={verse.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        {verse.surah_name} {verse.surah_number}:{verse.ayah_number}
                      </h4>
                      {verse.surah_name_ar && (
                        <span className="text-sm text-gray-500" dir="rtl">
                          {verse.surah_name_ar}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        verse.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {verse.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {verse.arabic_text && (
                      <div className="mb-3">
                        <p className="text-lg text-gray-900 leading-relaxed" dir="rtl">
                          {verse.arabic_text}
                        </p>
                      </div>
                    )}
                    
                    {verse.translation && (
                      <div className="mb-3">
                        <p className="text-gray-700 leading-relaxed">
                          {verse.translation}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      Added on {new Date(verse.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(verse)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Verse"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(verse.id)}
                      className={verse.is_active ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                      title={verse.is_active ? "Deactivate Verse" : "Activate Verse"}
                    >
                      {verse.is_active ? (
                        <XCircleIcon className="h-4 w-4" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(verse.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Verse"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}