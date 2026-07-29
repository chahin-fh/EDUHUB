"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  BookOpen,
  Sparkles,
  Loader2,
  AlertTriangle,
  Tag,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StaggerContainer, StaggerItem, AnimatedCard } from "@/components/animated-section";
import { toast } from "sonner";

interface Subject {
  _id: string;
  name: string;
  category?: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SubjectManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
  });
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkNames, setBulkNames] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/subjects", {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data || []);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Erreur lors du chargement des matières");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (bulkMode && !editingSubject) {
        // Bulk add mode
        const names = bulkNames
          .split("\n")
          .map((n) => n.trim())
          .filter((n) => n.length > 0);

        if (names.length === 0) {
          toast.error("Veuillez entrer au moins une matière");
          return;
        }

        let successCount = 0;
        for (const name of names) {
          try {
            const response = await fetch("http://localhost:5000/api/subjects", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: JSON.stringify({ name, category: formData.category || undefined }),
            });
            if (response.ok) successCount++;
          } catch (err) {
            console.error(`Failed to add subject "${name}":`, err);
          }
        }

        await fetchSubjects();
        toast.success(`${successCount}/${names.length} matière(s) ajoutée(s) avec succès`);
        setIsDialogOpen(false);
        resetForm();
        return;
      }

      const url = editingSubject
        ? `http://localhost:5000/api/subjects/${editingSubject._id}`
        : "http://localhost:5000/api/subjects";

      const method = editingSubject ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          category: formData.category.trim() || undefined,
        }),
      });

      if (response.ok) {
        await fetchSubjects();
        setIsDialogOpen(false);
        toast.success(
          editingSubject
            ? `Matière "${formData.name}" modifiée avec succès`
            : `Matière "${formData.name}" ajoutée avec succès`
        );
        resetForm();
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      category: subject.category || "",
    });
    setBulkMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const response = await fetch(`http://localhost:5000/api/subjects/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });

      if (response.ok) {
        await fetchSubjects();
        toast.success(`Matière "${deleteTarget.name}" supprimée`);
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", category: "" });
    setBulkMode(false);
    setBulkNames("");
    setEditingSubject(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
    const category = subject.category || "Non catégorisé";
    if (!acc[category]) acc[category] = [];
    acc[category].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  const sortedCategories = Object.keys(groupedSubjects).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Matières</h2>
          <p className="text-gray-500">Gérer toutes les matières disponibles sur la plateforme</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={openAddDialog}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-200"
              >
                <Plus className="h-4 w-4" />
                Ajouter une matière
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingSubject ? "Modifier" : "Ajouter"} une matière
              </DialogTitle>
              <DialogDescription>
                {editingSubject
                  ? "Modifiez les informations de la matière"
                  : "Ajoutez une ou plusieurs matières à la plateforme"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!editingSubject && (
                <div className="flex items-center gap-3 mb-2">
                  <Label htmlFor="bulkMode" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Ajout multiple
                  </Label>
                  <Switch
                    id="bulkMode"
                    checked={bulkMode}
                    onCheckedChange={setBulkMode}
                  />
                </div>
              )}

              {bulkMode && !editingSubject ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bulkNames">
                      Noms des matières <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-500">
                      Entrez un nom par ligne
                    </p>
                    <textarea
                      id="bulkNames"
                      value={bulkNames}
                      onChange={(e) => setBulkNames(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                      placeholder={`Mathématiques\nPhysique\nChimie\nBiologie\nInformatique`}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulkCategory">Catégorie commune (optionnelle)</Label>
                    <Input
                      id="bulkCategory"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="rounded-xl border-gray-200"
                      placeholder="ex: Sciences, Langues, Art..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nom de la matière <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="rounded-xl border-gray-200"
                      placeholder="ex: Mathématiques"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="rounded-xl border-gray-200"
                      placeholder="ex: Sciences, Langues, Art..."
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="rounded-xl border-gray-200"
                >
                  Annuler
                </Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingSubject ? "Modifier" : bulkMode ? "Ajouter tout" : "Ajouter"}
                  </Button>
                </motion.div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une matière..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/80 px-4 py-2 rounded-xl border border-gray-200">
          <BookOpen className="h-4 w-4" />
          <span>
            {filteredSubjects.length} / {subjects.length} matière(s)
          </span>
        </div>
      </div>

      {/* Subjects Grid */}
      <AnimatePresence mode="wait">
        {filteredSubjects.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-gray-200"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "Aucune matière trouvée" : "Aucune matière"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "Essayez de modifier votre recherche"
                : "Commencez par ajouter votre première matière"}
            </p>
            <Button
              onClick={openAddDialog}
              className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="h-4 w-4" />
              Ajouter une matière
            </Button>
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {sortedCategories.map((category) => (
              <div key={category} className="mb-8 last:mb-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                    <FolderOpen className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
                  <span className="text-sm text-gray-400">
                    ({groupedSubjects[category].length})
                  </span>
                </div>
                <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groupedSubjects[category].map((subject) => (
                    <StaggerItem key={subject._id}>
                      <AnimatedCard>
                        <Card className="group bg-white/90 backdrop-blur-sm border border-gray-200/80 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:-translate-y-1 h-full">
                          <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-5 group-hover:opacity-10 transition-opacity" />
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                                >
                                  <BookOpen className="h-5 w-5" />
                                </motion.div>
                                <div>
                                  <CardTitle className="text-base">{subject.name}</CardTitle>
                                  {subject.slug && (
                                    <CardDescription className="text-xs mt-0.5">
                                      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                                        {subject.slug}
                                      </code>
                                    </CardDescription>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {subject.category && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                                <Tag className="h-3 w-3" />
                                {subject.category}
                              </div>
                            )}
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(subject)}
                                  className="gap-1.5 rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-xs h-8"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                  Modifier
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(subject._id, subject.name)}
                                  className="gap-1.5 rounded-xl border-gray-200 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 text-xs h-8"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Supprimer
                                </Button>
                              </motion.div>
                            </div>
                          </CardContent>
                        </Card>
                      </AnimatedCard>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <DialogTitle>Confirmer la suppression</DialogTitle>
            </div>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la matière{" "}
              <strong>{deleteTarget?.name}</strong> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="rounded-xl border-gray-200"
            >
              Annuler
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 hover:bg-red-700 gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
