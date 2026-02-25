import { useEffect, useState } from "react";
import {
  getSMTPAccounts,
  updateSMTP,
  deleteSMTP,
} from "../client/smtpClient";

export interface SMTPAccount {
  id: string;
  name: string;
  host: string;
  port: number;
  from_email: string;
  from_name: string;
  is_active: boolean;
  created_at: string;
}

export function useSMTP() {
  const [accounts, setAccounts] = useState<SMTPAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSMTPAccounts();
        setAccounts(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleDefault = async (id: string, current: boolean) => {
    try {
      setProcessingId(id);

      await updateSMTP(id, { is_active: !current });

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id
            ? { ...acc, is_active: !current }
            : { ...acc, is_active: false }
        )
      );
    } finally {
      setProcessingId(null);
    }
  };

  const remove = async (id: string) => {
    try {
      setProcessingId(id);
      await deleteSMTP(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setProcessingId(null);
    }
  };

  return {
    accounts,
    loading,
    processingId,
    toggleDefault,
    remove,
  };
}
