"use client";

import { API_BASE } from "@/lib/api-config";

import { useState, useEffect, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Building,
  GraduationCap,
  Award,
  Users,
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StaggerContainer, StaggerItem, AnimatedCard } from "@/components/animated-section";
import { toast } from "sonner";

interface Establishment {
  _id: string;
  name: string;
  type: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  description: string;
  logo?: string;
  images: string[];
  rating: number;
  reviews?: Array<{
    user: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  isActive: boolean;
  isVerified: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

const establishmentTypes = [
  { value: "all", label: "Tous les types" },
  { value: "university", label: "Université" },
  { value: "school", label: "École" },
  { value: "college", label: "Collège" },
  { value: "training_center", label: "Centre de formation" },
  { value: "other", label: "Autre" },
];

const validEstablishmentTypes = establishmentTypes.slice(1);

const typeConfig: Record<string, { icon: any; color: string; gradient: string }> = {
  university: { icon: GraduationCap, color: "bg-purple-100 text-purple-600", gradient: "from-purple-500 to-purple-600" },
  school: { icon: Building, color: "bg-blue-100 text-blue-600", gradient: "from-blue-500 to-blue-600" },
  college: { icon: Award, color: "bg-green-100 text-green-600", gradient: "from-green-500 to-green-600" },
  training_center: { icon: Users, color: "bg-amber-100 text-amber-600", gradient: "from-amber-500 to-amber-600" },
  other: { icon: Building, color: "bg-gray-100 text-gray-600", gradient: "from-gray-500 to-gray-600" },
};

export default function EstablishmentManager() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "university" | "school" | "college" | "training_center" | "other">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEstablishment, setEditingEstablishment] = useState<Establishment | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    address: { street: "", city: "", state: "", postalCode: "", country: "Tunisia" },
    contact: { phone: "", email: "", website: "" },
    isActive: true,
    isVerified: false,
    featured: false,
  });

  const fetchEstablishments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterType !== "all") params.append("type", filterType);

      const response = await fetch(`${API_BASE}/api/establishments?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEstablishments(data.establishments || []);
      }
    } catch (error) {
      console.error("Error fetching establishments:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterType]);

  useEffect(() => {
    fetchEstablishments();
  }, [searchTerm, filterType, fetchEstablishments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingEstablishment
        ? `${API_BASE}/api/establishments/${editingEstablishment._id}`
        : `${API_BASE}/api/establishments`;

      const method = editingEstablishment ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchEstablishments();
        setIsDialogOpen(false);
        toast.success(editingEstablishment ? "Établissement modifié avec succès" : "Établissement ajouté avec succès");
        resetForm();
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (establishment: Establishment) => {
    setEditingEstablishment(establishment);
    setFormData({
      name: establishment.name,
      type: establishment.type,
      description: establishment.description,
      address: { ...establishment.address },
      contact: {
        phone: establishment.contact.phone,
        email: establishment.contact.email,
        website: establishment.contact.website || "",
      },
      isActive: establishment.isActive,
      isVerified: establishment.isVerified,
      featured: establishment.featured,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const response = await fetch(`${API_BASE}/api/establishments/${deleteTargetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });

      if (response.ok) {
        await fetchEstablishments();
        toast.success(`Établissement "${deleteTargetName}" supprimé`);
        setDeleteConfirmOpen(false);
        setDeleteTargetId(null);
        setDeleteTargetName("");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", type: "", description: "",
      address: { street: "", city: "", state: "", postalCode: "", country: "Tunisia" },
      contact: { phone: "", email: "", website: "" },
      isActive: true, isVerified: false, featured: false,
    });
    setEditingEstablishment(null);
  };

  const getTypeLabel = (type: string) => establishmentTypes.find((t) => t.value === type)?.label || type;

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
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Établissements</h2>
          <p className="text-gray-500">G&eacute;rer tous les &eacute;tablissements &eacute;ducatifs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
          <DialogTrigger asChild>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={resetForm} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-200">
                <Plus className="h-4 w-4" />
                Ajouter un établissement
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingEstablishment ? "Modifier" : "Ajouter"} un établissement
              </DialogTitle>
              <DialogDescription>
                {editingEstablishment
                  ? "Modifiez les informations de l'établissement"
                  : "Ajoutez un nouvel établissement à la plateforme"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l&apos;&eacute;tablissement *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type d&apos;&eacute;tablissement *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="rounded-xl border-gray-200">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {validEstablishmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} required className="rounded-xl border-gray-200" />
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  Adresse
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="street">Rue *</Label>
                    <Input id="street" value={formData.address.street} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })} required className="rounded-xl border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input id="city" value={formData.address.city} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} required className="rounded-xl border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Région *</Label>
                    <Input id="state" value={formData.address.state} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })} required className="rounded-xl border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal *</Label>
                    <Input id="postalCode" value={formData.address.postalCode} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, postalCode: e.target.value } })} required className="rounded-xl border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input id="country" value={formData.address.country} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })} className="rounded-xl border-gray-200" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input id="phone" value={formData.contact.phone} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })} required className="rounded-xl border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={formData.contact.email} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })} required className="rounded-xl border-gray-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input id="website" value={formData.contact.website} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, website: e.target.value } })} className="rounded-xl border-gray-200" />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                {[
                  { label: "Actif", key: "isActive" as const },
                  { label: "Vérifié", key: "isVerified" as const },
                  { label: "Vedette", key: "featured" as const },
                ].map(({ label, key }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <Switch
                      checked={formData[key]}
                      onCheckedChange={(checked) => setFormData({ ...formData, [key]: checked })}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }} className="rounded-xl border-gray-200">
                  Annuler
                </Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingEstablishment ? "Modifier" : "Ajouter"}
                  </Button>
                </motion.div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un établissement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 focus:border-blue-500"
          />
        </div>
        <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
          <SelectTrigger className="w-48 rounded-xl border-gray-200">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            {establishmentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Establishments Grid */}
      <AnimatePresence mode="wait">
        {establishments.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-gray-200"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun établissement trouvé</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterType !== "all"
                ? "Essayez de modifier vos filtres de recherche"
                : "Commencez par ajouter votre premier établissement"}
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="h-4 w-4" />
              Ajouter un établissement
            </Button>
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {establishments.map((est) => {
                const config = typeConfig[est.type] || typeConfig.other;
                const Icon = config.icon;
                return (
                  <StaggerItem key={est._id}>
                    <AnimatedCard>
                      <Card className="group bg-white/90 backdrop-blur-sm border border-gray-200/80 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden h-full hover:-translate-y-1">
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-br ${config.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                        <CardHeader className="pb-3 border-b border-gray-100">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`p-2.5 rounded-xl ${config.color}`}
                              >
                                <Icon className="h-5 w-5" />
                              </motion.div>
                              <div>
                                <CardTitle className="text-lg">{est.name}</CardTitle>
                                <CardDescription>{getTypeLabel(est.type)}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {est.featured && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium flex items-center gap-1"
                                >
                                  <Sparkles className="h-3 w-3" />
                                  Vedette
                                </motion.span>
                              )}
                              {est.isVerified && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Vérifié
                                </motion.span>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {est.address.city}, {est.address.state}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {est.contact.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {est.contact.email}
                          </div>
                          {est.contact.website && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <a href={est.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Site web
                              </a>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-sm">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium text-gray-900">{est.rating.toFixed(1)}</span>
                            <span className="text-gray-400">({est.reviews?.length || 0} avis)</span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{est.description}</p>

                          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(est)} className="gap-1.5 rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50">
                                <Edit className="h-3.5 w-3.5" />
                                Modifier
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                              <Button size="sm" variant="outline" onClick={() => handleDelete(est._id, est.name)} className="gap-1.5 rounded-xl border-gray-200 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700">
                                <Trash2 className="h-3.5 w-3.5" />
                                Supprimer
                              </Button>
                            </motion.div>
                            {!est.isActive && (
                              <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                                <XCircle className="h-3 w-3" />
                                Inactif
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </AnimatedCard>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
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
              &Ecirc;tes-vous s&ucirc;r de vouloir supprimer l&apos;&eacute;tablissement <strong>{deleteTargetName}</strong> ? Cette action est irr&eacute;versible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="rounded-xl border-gray-200">
              Annuler
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={confirmDelete} className="rounded-xl bg-red-600 hover:bg-red-700 gap-2">
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
