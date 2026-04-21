import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

export default function useCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/donation-projects");
      setCampaigns(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const message = err?.response?.data?.error || "تعذر تحميل الحملات حالياً";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaigns, loading, error, refetch: fetchCampaigns };
}
