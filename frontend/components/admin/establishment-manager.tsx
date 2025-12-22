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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";

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

const validEstablishmentTypes = [
  { value: "university", label: "Université" },
  { value: "school", label: "École" },
  { value: "college", label: "Collège" },
  { value: "training_center", label: "Centre de formation" },
  { value: "other", label: "Autre" },
];

export default function EstablishmentManager() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "university" | "school" | "college" | "training_center" | "other"
  >("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEstablishment, setEditingEstablishment] =
    useState<Establishment | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    type: string;
    description: string;
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
    isActive: boolean;
    isVerified: boolean;
    featured: boolean;
  }>({
    name: "",
    type: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Tunisia",
    },
    contact: {
      phone: "",
      email: "",
      website: "",
    },
    isActive: true,
    isVerified: false,
    featured: false,
  });

  useEffect(() => {
    fetchEstablishments();
  }, [searchTerm, filterType]);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterType) params.append("type", filterType);

      const response = await fetch(
        `http://localhost:5000/api/establishments?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEstablishments(data.establishments || []);
      }
    } catch (error) {
      console.error("Error fetching establishments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug log pour voir les données envoyées
    console.log(
      "Données du formulaire envoyées:",
      JSON.stringify(formData, null, 2)
    );

    try {
      const url = editingEstablishment
        ? `http://localhost:5000/api/establishments/${editingEstablishment._id}`
        : "http://localhost:5000/api/establishments";

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
        resetForm();
      }
    } catch (error) {
      console.error("Error saving establishment:", error);
    }
  };

  const handleEdit = (establishment: Establishment) => {
    setEditingEstablishment(establishment);
    setFormData({
      name: establishment.name,
      type: establishment.type,
      description: establishment.description,
      address: establishment.address,
      contact: establishment.contact,
      isActive: establishment.isActive,
      isVerified: establishment.isVerified,
      featured: establishment.featured,
    });
    setIsDialogOpen(true);
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/establishments/${deleteTargetId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        await fetchEstablishments();
        setDeleteConfirmOpen(false);
        setDeleteTargetId(null);
      }
    } catch (error) {
      console.error("Error deleting establishment:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      description: "",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Tunisia",
      },
      contact: {
        phone: "",
        email: "",
        website: "",
      },
      isActive: true,
      isVerified: false,
      featured: false,
    });
    setEditingEstablishment(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "university":
        return <GraduationCap className="h-4 w-4" />;
      case "school":
        return <Building className="h-4 w-4" />;
      case "college":
        return <Award className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const found = establishmentTypes.find((t) => t.value === type);
    return found?.label || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestion des Établissements
          </h2>
          <p className="text-gray-600">
            Gérer tous les établissements éducatifs
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un établissement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEstablishment ? "Modifier" : "Ajouter"} un établissement
              </DialogTitle>
              <DialogDescription>
                {editingEstablishment
                  ? "Modifiez les informations de l'établissement"
                  : "Ajoutez un nouvel établissement à la plateforme"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l&apos;établissement *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type d&apos;établissement *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {validEstablishmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Adresse</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Rue *</Label>
                    <Input
                      id="street"
                      value={formData.address.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            street: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            city: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">Région *</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            state: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal *</Label>
                    <Input
                      id="postalCode"
                      value={formData.address.postalCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            postalCode: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      value={formData.address.country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            country: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={formData.contact.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: {
                            ...formData.contact,
                            phone: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: {
                            ...formData.contact,
                            email: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    value={formData.contact.website}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: {
                          ...formData.contact,
                          website: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  {editingEstablishment ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un établissement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(value) =>
            setFilterType(
              value as
                | "all"
                | "university"
                | "school"
                | "college"
                | "training_center"
                | "other"
            )
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            {establishmentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Establishments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {establishments.map((establishment) => (
          <Card
            key={establishment._id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getTypeIcon(establishment.type)}
                  <CardTitle className="text-lg">
                    {establishment.name}
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  {establishment.featured && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Vedette
                    </span>
                  )}
                  {establishment.isVerified && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Vérifié
                    </span>
                  )}
                </div>
              </div>
              <CardDescription>
                {getTypeLabel(establishment.type)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {establishment.address.city}, {establishment.address.state}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                {establishment.contact.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                {establishment.contact.email}
              </div>
              {establishment.contact.website && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="h-4 w-4" />
                  <a
                    href={establishment.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Site web
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{establishment.rating.toFixed(1)}</span>
                <span className="text-gray-500">
                  ({establishment.reviews?.length || 0} avis)
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {establishment.description}
              </p>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(establishment)}
                  className="gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(establishment._id)}
                  className="gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {establishments.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun établissement trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType
              ? "Essayez de modifier vos filtres de recherche"
              : "Commencez par ajouter votre premier établissement"}
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un établissement
          </Button>
        </div>
      )}
    </div>
  );
}
