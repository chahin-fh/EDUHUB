"use client";

import { API_BASE } from "@/lib/api-config";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, Edit, Plus, Sparkles, BookOpen, Loader2, Check, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, AnimatedSection, StaggerContainer, StaggerItem } from "@/components/animated-section";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [subjects, setSubjects] = useState<{ _id: string; name: string; slug?: string; category?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState("");
  const [editingSubject, setEditingSubject] = useState<{ _id: string; name: string } | null>(null);
  const [editingText, setEditingText] = useState("");
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch("${API_BASE}/api/subjects");
        if (!res.ok) throw new Error("Failed to fetch subjects");
        const data = await res.json();
        setSubjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    setAddingNew(true);
    try {
      const res = await fetch("${API_BASE}/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ name: newSubject.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add subject");
      const data = await res.json();
      setSubjects([...subjects, data]);
      toast.success(`Matière "${newSubject.trim()}" ajoutée`);
      setNewSubject("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'ajout");
    } finally {
      setAddingNew(false);
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/subjects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      if (!res.ok) throw new Error("Failed to delete subject");
      setSubjects(subjects.filter((s) => s._id !== id));
      toast.success(`Matière "${name}" supprimée`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  const handleEditSubject = (subject: { _id: string; name: string }) => {
    setEditingSubject(subject);
    setEditingText(subject.name);
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject || !editingText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/subjects/${editingSubject._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ name: editingText.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update subject");
      const data = await res.json();
      setSubjects(subjects.map((s) => (s._id === editingSubject._id ? data : s)));
      toast.success(`Matière mise à jour`);
      setEditingSubject(null);
      setEditingText("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Configuration
            </span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Paramètres du site
            </h1>
            <p className="text-gray-500 mt-2">Gérez les matières et la configuration de la plateforme</p>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Card className="border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Gérer les matières</CardTitle>
                    <CardDescription>Ajoutez, modifiez ou supprimez les matières disponibles sur la plateforme</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>
                ) : (
                  <>
                    <StaggerContainer className="space-y-2 mb-6">
                      <AnimatePresence mode="popLayout">
                        {subjects.map((subject, idx) => (
                          <StaggerItem key={subject._id}>
                            <motion.div
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50/50 transition-colors border border-gray-100 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                  {subject.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  {editingSubject?._id === subject._id ? (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="h-9 text-sm border-blue-200 focus:border-blue-500"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") handleUpdateSubject();
                                          if (e.key === "Escape") setEditingSubject(null);
                                        }}
                                      />
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleUpdateSubject}
                                        className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                      >
                                        <Check className="h-4 w-4" />
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setEditingSubject(null)}
                                        className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                      >
                                        <X className="h-4 w-4" />
                                      </motion.button>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="font-medium text-gray-900">{subject.name}</p>
                                      {subject.slug && (
                                        <p className="text-xs text-gray-400">{subject.slug}</p>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                              {editingSubject?._id !== subject._id && (
                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleEditSubject(subject)}
                                    className="p-2 hover:bg-blue-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDeleteSubject(subject._id, subject.name)}
                                    className="p-2 hover:bg-red-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </motion.button>
                                </div>
                              )}
                            </motion.div>
                          </StaggerItem>
                        ))}
                      </AnimatePresence>
                    </StaggerContainer>

                    {/* Add new subject */}
                    <div className="border-t border-gray-200 pt-6">
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">Ajouter une nouvelle matière</Label>
                      <div className="flex gap-3">
                        <Input
                          placeholder="Nom de la matière..."
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          className="flex-1 border-gray-200 focus:border-blue-500 rounded-xl"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !addingNew) handleAddSubject();
                          }}
                        />
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={handleAddSubject}
                            disabled={addingNew || !newSubject.trim()}
                            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
                          >
                            {addingNew ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                            Ajouter
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </PageTransition>
  );
}
