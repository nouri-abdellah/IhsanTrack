import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

export default function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/events");
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const message = err?.response?.data?.error || "تعذر تحميل الفعاليات حالياً";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}
