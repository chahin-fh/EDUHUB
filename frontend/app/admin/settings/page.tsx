"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, Plus } from 'lucide-react';

export default function AdminSettingsPage() {
  const [subjects, setSubjects] = useState<{ _id: string, name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [editingSubject, setEditingSubject] = useState<{ _id: string, name: string } | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/subjects');
        if (!res.ok) throw new Error('Failed to fetch subjects');
        const data = await res.json();
        setSubjects(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ name: newSubject.trim() })
      });
      if (!res.ok) throw new Error('Failed to add subject');
      const data = await res.json();
      setSubjects([...subjects, data]);
      setNewSubject('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/subjects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete subject');
      setSubjects(subjects.filter(subject => subject._id !== id));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const handleEditSubject = (subject: { _id: string, name: string }) => {
    setEditingSubject(subject);
    setEditingText(subject.name);
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject || !editingText.trim()) return;
    try {
      const res = await fetch(`http://localhost:5000/api/subjects/${editingSubject._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ name: editingText.trim() })
      });
      if (!res.ok) throw new Error('Failed to update subject');
      const data = await res.json();
      setSubjects(subjects.map(s => s._id === editingSubject._id ? data : s));
      setEditingSubject(null);
      setEditingText('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Paramètres du site</h1>
        <Card>
          <CardHeader>
            <CardTitle>Gérer les matières</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <p>Chargement...</p>}
            {error && <p className="text-destructive">Erreur: {error}</p>}
            {!isLoading && !error && (
              <div className="space-y-4">
                {subjects.map(subject => (
                  <div key={subject._id} className="flex items-center justify-between p-2 rounded-lg bg-gray-100">
                    {editingSubject?._id === subject._id ? (
                      <Input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="flex-grow mr-2"
                      />
                    ) : (
                      <span>{subject.name}</span>
                    )}
                    <div className="flex items-center gap-2">
                      {editingSubject?._id === subject._id ? (
                        <Button onClick={handleUpdateSubject} size="sm">Sauvegarder</Button>
                      ) : (
                        <Button onClick={() => handleEditSubject(subject)} variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button onClick={() => handleDeleteSubject(subject._id)} variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <Input
                placeholder="Nouvelle matière"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
              <Button onClick={handleAddSubject}>
                <Plus className="h-4 w-4 mr-2" /> Ajouter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
