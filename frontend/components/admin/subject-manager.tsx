"use client";

import { API_BASE } from "@/lib/api-config";

import { useState, useEffect, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
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
  Layers,
  Check,
  ListChecks,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StaggerContainer, StaggerItem, AnimatedCard } from "@/components/animated-section";
import { toast } from "sonner";
import { cn, timeAgo } from "@/lib/utils";

interface Subject {
  _id: string;
  name: string;
  category?: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
}

// Palette de couleurs déterministe par catégorie (aucune donnée backend requise)
const CATEGORY_COLORS: Record<string, string> = {
  "Sciences": "from-emerald-500 to-teal-600",
  "Mathématiques": "from-blue-500 to-indigo-600",
  "Langues": "from-violet-500 to-purple-600",
  "Technologie": "from-cyan-500 to-blue-600",
  "Arts": "from-pink-500 to-rose-600",
  "Sport": "from-orange-500 to-amber-600",
  "Histoire": "from-amber-500 to-yellow-600",
  "Géographie": "from-lime-500 to-green-600",
};

const CATEGORY_CHIP_STYLES: Record<string, string> = {
  "Sciences": "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  "Mathématiques": "bg-blue-100 text-blue-700 hover:bg-blue-200",
  "Langues": "bg-violet-100 text-violet-700 hover:bg-violet-200",
  "Technologie": "bg-cyan-100 text-cyan-700 hover:bg-cyan-200",
  "Arts": "bg-pink-100 text-pink-700 hover:bg-pink-200",
  "Sport": "bg-orange-100 text-orange-700 hover:bg-orange-200",
  "Histoire": "bg-amber-100 text-amber-700 hover:bg-amber-200",
  "Géographie": "bg-lime-100 text-lime-700 hover:bg-lime-200",
};

const DEFAULT_GRADIENT = "from-blue-500 to-purple-600";

const CATEGORY_SUGGESTIONS = [
  "Mathématiques",
  "Sciences",
  "Langues",
  "Technologie",
  "Arts",
  "Histoire",
  "Géographie",
  "Sport",
];

function getCategoryGradient(category?: string) {
  if (!category) return DEFAULT_GRADIENT;
  return CATEGORY_COLORS[category] || DEFAULT_GRADIENT;
}

function getCategoryChip(category?: string) {
  if (!category) return "bg-gray-100 text-gray-600 hover:bg-gray-200";
  return CATEGORY_CHIP_STYLES[category] || "bg-gray-100 text-gray-600 hover:bg-gray-200";
}

export default function SubjectManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
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
      const response = await fetch(`${API_BASE}/api/subjects`, {
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
            const response = await fetch(`${API_BASE}/api/subjects`, {
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
        ? `${API_BASE}/api/subjects/${editingSubject._id}`
        : `${API_BASE}/api/subjects`;

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
      const response = await fetch(`${API_BASE}/api/subjects/${deleteTarget.id}`, {
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
      (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.category && s.category.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (!activeCategory || s.category === activeCategory)
  );

  const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
    const category = subject.category || "Non catégorisé";
    if (!acc[category]) acc[category] = [];
    acc[category].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  const sortedCategories = Object.keys(groupedSubjects).sort();

  // Toutes les catégories présentes (pour les filtres)
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    subjects.forEach((s) => {
      const c = s.category || "Non catégorisé";
      cats.add(c);
    });
    return Array.from(cats).sort();
  }, [subjects]);

  const bulkNameList = useMemo(
    () =>
      bulkNames
        .split("\n")
        .map((n) => n.trim())
        .filter((n) => n.length > 0),
    [bulkNames]
  );

  // Aperçu en direct de la carte matière
  const previewName = formData.name.trim() || "Nom de la matière";
  const previewCategory = formData.category.trim();
  const previewGradient = getCategoryGradient(previewCategory);

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
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-200">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Gestion des Matières</h2>
          </div>
          <p className="text-gray-500 ml-[52px]">Gérer toutes les matières disponibles sur la plateforme</p>
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
          <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">
            {/* Bandeau dégradé */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 pt-6 pb-7 text-white">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -left-10 w-44 h-44 bg-white/10 rounded-full blur-2xl" />
              <div className="relative">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl text-white">
                        {editingSubject ? "Modifier la matière" : "Ajouter une matière"}
                      </DialogTitle>
                      <DialogDescription className="text-blue-100">
                        {editingSubject
                          ? "Modifiez les informations de la matière"
                          : "Ajoutez une ou plusieurs matières à la plateforme"}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 pt-5 pb-6 max-h-[65vh] overflow-y-auto">
              {/* Aperçu en direct */}
              {!bulkMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 flex items-center gap-4"
                >
                  <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-lg font-bold shrink-0", previewGradient)}>
                    {previewName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{previewName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {previewCategory ? (
                        <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", getCategoryChip(previewCategory))}>
                          <Tag className="h-3 w-3" />
                          {previewCategory}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Aucune catégorie sélectionnée</span>
                      )}
                    </div>
                  </div>
                  <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                </motion.div>
              )}

              {!editingSubject && (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ListChecks className="h-4 w-4 text-blue-600" />
                    <div>
                      <Label htmlFor="bulkMode" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Ajout multiple
                      </Label>
                      <p className="text-xs text-gray-400">Ajoutez plusieurs matières d&apos;un coup</p>
                    </div>
                  </div>
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
                    <p className="text-xs text-gray-500">Entrez un nom par ligne</p>
                    <textarea
                      id="bulkNames"
                      value={bulkNames}
                      onChange={(e) => setBulkNames(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                      placeholder={`Mathématiques\nPhysique\nChimie\nBiologie\nInformatique`}
                      required
                    />
                    {bulkNameList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <AnimatePresence>
                          {bulkNameList.slice(0, 12).map((n, i) => (
                            <motion.span
                              key={`${n}-${i}`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full"
                            >
                              <Check className="h-3 w-3" />
                              {n}
                            </motion.span>
                          ))}
                        </AnimatePresence>
                        {bulkNameList.length > 12 && (
                          <span className="text-xs text-gray-400 self-center">
                            +{bulkNameList.length - 12} autres
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulkCategory">Catégorie commune (optionnelle)</Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_SUGGESTIONS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: formData.category === cat ? "" : cat })}
                          className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                            formData.category === cat
                              ? cn("border-transparent", getCategoryChip(cat))
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <Input
                      id="bulkCategory"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="rounded-xl border-gray-200"
                      placeholder="ou écrivez votre propre catégorie..."
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
                      autoFocus
                      className="rounded-xl border-gray-200 focus:border-blue-500 text-base"
                      placeholder="ex: Mathématiques"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_SUGGESTIONS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: formData.category === cat ? "" : cat })}
                          className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                            formData.category === cat
                              ? cn("border-transparent", getCategoryChip(cat))
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="rounded-xl border-gray-200"
                      placeholder="ou écrivez votre propre catégorie..."
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

      {/* Filtres par catégorie */}
      {allCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("")}
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
              !activeCategory
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-sm"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            Toutes ({subjects.length})
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? "" : cat)}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                activeCategory === cat
                  ? cn("border-transparent", getCategoryChip(cat), "shadow-sm")
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {cat} ({subjects.filter((s) => (s.category || "Non catégorisé") === cat).length})
            </button>
          ))}
        </div>
      )}

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
              {searchTerm || activeCategory ? "Aucune matière trouvée" : "Aucune matière"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || activeCategory
                ? "Essayez de modifier votre recherche ou vos filtres"
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
                  <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", getCategoryGradient(category))}>
                    <FolderOpen className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
                  <Badge variant="secondary" className="rounded-full bg-gray-100 text-gray-600">
                    {groupedSubjects[category].length}
                  </Badge>
                </div>
                <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groupedSubjects[category].map((subject) => (
                    <StaggerItem key={subject._id}>
                      <AnimatedCard>
                        <Card className="group bg-white/90 backdrop-blur-sm border border-gray-200/80 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:-translate-y-1 h-full">
                          <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-br opacity-5 group-hover:opacity-15 transition-opacity", getCategoryGradient(subject.category))} />
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className={cn("p-2.5 rounded-xl bg-gradient-to-br shadow-sm", getCategoryGradient(subject.category))}>
                                  <BookOpen className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <CardTitle className="text-base">{subject.name}</CardTitle>
                                  {subject.createdAt && (
                                    <CardDescription className="text-xs mt-0.5">
                                      Ajouté {timeAgo(subject.createdAt)}
                                    </CardDescription>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {subject.category ? (
                              <div className="flex items-center gap-1.5 mb-3">
                                <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full", getCategoryChip(subject.category))}>
                                  <Tag className="h-3 w-3" />
                                  {subject.category}
                                </span>
                                {subject.slug && (
                                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-500">
                                    {subject.slug}
                                  </code>
                                )}
                              </div>
                            ) : (
                              subject.slug && (
                                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-500 mb-3 inline-block">
                                  {subject.slug}
                                </code>
                              )
                            )}
                            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
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
