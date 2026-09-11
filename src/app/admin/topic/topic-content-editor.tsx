"use client";

import { useState } from "react";
import { saveTopicContent } from "./actions";
import TopicEditor from "./topic-editor";
import PointsEditor from "./points-editor";

type Props = {
  topicId: string;
  initialContent: Record<string, unknown>;
  initialPoints: string[];
};

export default function TopicContentEditor({
  topicId,
  initialContent,
  initialPoints,
}: Props) {
  const [body, setBody] = useState(initialContent);

  const [points, setPoints] = useState<string[]>(
    initialPoints.length > 0
      ? initialPoints
      : [""]
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const cleanedPoints = points
      .map((point) => point.trim())
      .filter(Boolean);

    const result = await saveTopicContent(
      topicId,
      body,
      cleanedPoints
    );

    if (!result.success) {
      setMessage(
        result.error ?? "Could not save changes."
      );
      setSaving(false);
      return;
    }

    setMessage("Changes saved.");
    setSaving(false);
  }

  return (
    <div>
      <div className="mt-6 flex items-center justify-end gap-4">
        {message && (
          <span className="text-sm text-[#777168]">
            {message}
          </span>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[#2c2925] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#454039] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Learning Material
        </h2>

        <TopicEditor
          initialContent={initialContent}
          onChange={setBody}
        />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">
          Points to Remember
        </h2>

        <PointsEditor
          points={points}
          onChange={setPoints}
        />
      </section>

      
    </div>
  );
}