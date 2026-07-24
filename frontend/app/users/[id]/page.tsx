"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Star,
  BookOpen,
  Users,
  Award,
  Clock,
  CheckCircle,
  User,
  MapPin,
  Globe,
  Loader2,
  AlertCircle,
  GraduationCap,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { RatingStars, ReviewForm } from "@/components/rating-stars";

interface Subject {
  _id: string;
  name: string;
  slug: string;
}

interface ExpertiseItem {
  subject: Subject;
  level: string;
  verified: boolean;
}

interface LearningGoal {
  subject: Subject;
  level: string;
}

interface MonitorProfile {
  expertise: ExpertiseItem[];
  verified: boolean;
  rating: number;
  ratingsCount: number;
  coursesCreated: number;
}

interface Review {
  _id: string;
  from: { _id: string; name: string; username: string; avatar?: string };
  to: string;
  subject: Subject;
  rating: number;
  comment: string;
  createdAt: string;
}

interface UserData {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "user";
  isMonitor: boolean;
  monitorProfile?: MonitorProfile;
  learningGoals?: LearningGoal[];
  avatar?: string;
  bio?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  emailVerified: boolean;
}

interface Course {
  _id: string;
  courseName: string;
  description: string;
  createdAt: string;
  status: string;
  category?: string;
  level?: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  const userId = params.id as string;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<{
    total: number;
    average: number;
    distribution: number[];
  } | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sendingReview, setSendingReview] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    fetchUserDetails();
    fetchReviews();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;

      if (!token) {
        router.push("/connexion");
        return;
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(
        `http://localhost:5000/api/usersList/${userId}`,
        { headers }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          router.push("/connexion");
          return;
        }
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      if (data.success) {
        setUserData(data.user);
        setCourses(data.courses || []);
      } else {
        setError(data.message || "Error fetching user details");
      }
    } catch (err: any) {
      console.error("Error fetching user details:", err);
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/reviews/user/${userId}`
      );
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
        setReviewStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleSendRequest = async () => {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }

    if (!userData?.monitorProfile?.expertise?.length) {
      alert("Cet utilisateur n'enseigne aucune matière");
      return;
    }

    setSendingRequest(true);
    try {
      const token = localStorage.getItem("authToken");
      const firstExpertise = userData.monitorProfile.expertise[0];
      const subjectId =
        typeof firstExpertise.subject === "object"
          ? firstExpertise.subject._id
          : firstExpertise.subject;

      const res = await fetch("http://localhost:5000/api/matching/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mentorId: userId,
          subjectId,
          message: `Bonjour, j'aimerais apprendre ${
            typeof firstExpertise.subject === "object"
              ? firstExpertise.subject.name
              : "cette matière"
          } avec vous !`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Demande envoyée avec succès !");
      } else {
        alert(data.message || "Erreur lors de l'envoi");
      }
    } catch (err) {
      console.error("Error sending request:", err);
      alert("Erreur lors de l'envoi de la demande");
    } finally {
      setSendingRequest(false);
    }
  };

  const handleSubmitReview = async (data: { rating: number; comment: string }) => {
    if (!isAuthenticated || !currentUser) {
      router.push("/connexion");
      return;
    }

    setSendingReview(true);
    try {
      const token = localStorage.getItem("authToken");
      const subjectId =
        userData?.monitorProfile?.expertise?.[0]?.subject?._id;

      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toUserId: userId,
          subjectId,
          rating: data.rating,
          comment: data.comment,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setShowReviewForm(false);
        fetchReviews();
        alert("Avis envoyé avec succès !");
      } else {
        alert(result.message || "Erreur lors de l'envoi de l'avis");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Erreur lors de l'envoi de l'avis");
    } finally {
      setSendingReview(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOwnProfile = currentUser?.id === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/users" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl mx-auto text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <p className="text-lg">{error || "Utilisateur non trouvé"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/users"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        {/* Hero Section */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-xl mb-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              {userData.avatar ? (
                <img src={userData.avatar} alt={userData.name} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-bold">
                  {(userData.name || userData.username || "U").charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-900">
                {userData.name || userData.username}
              </h1>
              {userData.bio && (
                <p className="text-gray-600 mt-2">{userData.bio}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3 justify-center lg:justify-start">
                {userData.monitorProfile?.expertise?.map((exp, idx) => (
                  <Badge key={idx} className="bg-blue-100 text-blue-800">
                    {typeof exp.subject === "object" ? exp.subject.name : exp.subject}
                    {exp.verified && <Award className="h-3 w-3 ml-1 inline" />}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0">
              {!isOwnProfile && isAuthenticated && (
                <div className="flex flex-col gap-2">
                  <Button onClick={handleSendRequest} disabled={sendingRequest} className="gap-2">
                    {sendingRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Demander une session
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Goals */}
            {userData.learningGoals && userData.learningGoals.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-orange-600" />
                    Apprend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userData.learningGoals.map((goal, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm bg-orange-50">
                        {typeof goal.subject === "object" ? goal.subject.name : goal.subject}
                        <span className="ml-1 text-xs text-gray-500">({goal.level})</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Teaching */}
            {userData.isMonitor && userData.monitorProfile && (
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    Enseigne
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">
                        {userData.monitorProfile.rating || 0}
                      </div>
                      <div className="text-sm text-gray-600">Note moyenne</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {userData.monitorProfile.ratingsCount || 0}
                      </div>
                      <div className="text-sm text-gray-600">Avis reçus</div>
                    </div>
                  </div>
                  {userData.monitorProfile.expertise?.map((exp, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="font-medium text-gray-900">
                        {typeof exp.subject === "object" ? exp.subject.name : exp.subject}
                      </span>
                      <Badge variant="secondary">{exp.level}</Badge>
                    </div>
                  ))}
                  {userData.monitorProfile.verified && (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">Moniteur vérifié</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Avis reçus
                  {reviewStats && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({reviewStats.total})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviewStats && reviewStats.total > 0 && (
                  <div className="flex items-center gap-2 mb-6">
                    <RatingStars
                      initialRating={reviewStats.average}
                      readonly
                      size="md"
                      showValue
                      count={reviewStats.total}
                    />
                  </div>
                )}

                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Aucun avis pour le moment
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {(review.from.name || review.from.username || "U").charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {review.from.name || review.from.username}
                            </p>
                            <RatingStars initialRating={review.rating} readonly size="sm" />
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 ml-11">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!isOwnProfile && isAuthenticated && (
                  <div className="mt-6 pt-4 border-t">
                    {showReviewForm ? (
                      <ReviewForm onSubmit={handleSubmitReview} loading={sendingReview} />
                    ) : (
                      <Button onClick={() => setShowReviewForm(true)} variant="outline" className="gap-2">
                        <Star className="h-4 w-4" />
                        Laisser un avis
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isOwnProfile && isAuthenticated && (
                  <>
                    <Button onClick={handleSendRequest} disabled={sendingRequest} className="w-full gap-2">
                      {sendingRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                      Demander une session
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Phone className="h-4 w-4" />
                      Appel vidéo
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Statut</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Compte</span>
                  <Badge className={userData.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {userData.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email</span>
                  <Badge className={userData.emailVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {userData.emailVerified ? "Vérifié" : "Non vérifié"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Inscrit</span>
                  <span className="text-sm text-gray-900">{formatDate(userData.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
