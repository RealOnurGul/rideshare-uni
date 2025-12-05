"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  isDefault: boolean;
}

export default function VehiclesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    make: "",
    customMake: "",
    model: "",
    year: new Date().getFullYear().toString(),
    color: "",
    licensePlate: "",
    isDefault: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Use customMake if "Other" is selected
    const finalMake = formData.make === "Other" ? formData.customMake : formData.make;

    if (!finalMake) {
      setError("Please enter a vehicle make");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          make: finalMake,
        }),
      });

      if (res.ok) {
        setFormData({
          make: "",
          customMake: "",
          model: "",
          year: new Date().getFullYear().toString(),
          color: "",
          licensePlate: "",
          isDefault: false,
        });
        setShowForm(false);
        fetchVehicles();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add vehicle");
      }
    } catch (err) {
      setError("Failed to add vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchVehicles();
      }
    } catch (err) {
      console.error("Error deleting vehicle:", err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        fetchVehicles();
      }
    } catch (err) {
      console.error("Error setting default:", err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  const popularMakes = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "Hyundai", "Mazda", "Subaru", "Volkswagen", "BMW", "Mercedes-Benz", "Audi", "Kia", "Jeep", "Tesla"];
  const colors = ["White", "Black", "Silver", "Gray", "Red", "Blue", "Green", "Brown", "Beige", "Orange", "Yellow", "Purple"];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
            <p className="text-gray-600 mt-1">Manage your vehicles to offer rides</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors cursor-pointer flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Vehicle
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Vehicle</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Make *</label>
                  <select
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value, customMake: "" })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                    required
                  >
                    <option value="">Select make...</option>
                    {popularMakes.map((make) => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. Camry, Civic, Focus"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                {formData.make === "Other" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Make *</label>
                    <input
                      type="text"
                      value={formData.customMake}
                      onChange={(e) => setFormData({ ...formData, customMake: e.target.value })}
                      placeholder="Enter your vehicle's make (e.g. Rivian, Lucid, Polestar)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Year *</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                    required
                  >
                    {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color *</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                    required
                  >
                    <option value="">Select color...</option>
                    {colors.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">License Plate *</label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                    placeholder="e.g. ABC 123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded cursor-pointer"
                />
                <label htmlFor="isDefault" className="text-gray-700 cursor-pointer">
                  Set as default vehicle
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Adding..." : "Add Vehicle"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No vehicles yet</h3>
            <p className="text-gray-600 mb-6">Add a vehicle to start offering rides</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors cursor-pointer"
            >
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`bg-white rounded-2xl shadow-sm border-2 p-6 ${
                  vehicle.isDefault ? "border-purple-300 bg-purple-50/30" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        {vehicle.isDefault && (
                          <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: vehicle.color.toLowerCase() }}></span>
                          {vehicle.color}
                        </span>
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                          {vehicle.licensePlate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!vehicle.isDefault && (
                      <button
                        onClick={() => handleSetDefault(vehicle.id)}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/rides/new" className="text-purple-600 hover:text-purple-700 font-medium cursor-pointer">
            ← Back to offer a ride
          </Link>
        </div>
      </div>
    </div>
  );
}

