"use client";

type Props = {
  points: string[];
  onChange: (points: string[]) => void;
};

export default function PointsEditor({
  points,
  onChange,
}: Props) {
  function updatePoint(index: number, value: string) {
    onChange(
      points.map((point, i) =>
        i === index ? value : point
      )
    );
  }

  function addPoint() {
    onChange([...points, ""]);
  }

  function removePoint(index: number) {
    onChange(
      points.filter((_, i) => i !== index)
    );
  }

  return (
    <div className="rounded-xl border border-[#e7e1d8] bg-white p-5">
      <div className="space-y-3">
        {points.map((point, index) => (
          <div
            key={index}
            className="flex items-start gap-3"
          >
            <span className="mt-3 text-[#8a6f47]">
              •
            </span>

            <input
              value={point}
              onChange={(e) =>
                updatePoint(index, e.target.value)
              }
              placeholder="Enter an important point..."
              className="flex-1 rounded-lg border border-[#d8d1c7] bg-white px-3 py-2.5 text-sm text-[#2c2925] outline-none placeholder:text-[#aaa39a] focus:border-[#8a6f47]"
            />

            <button
              type="button"
              onClick={() => removePoint(index)}
              disabled={points.length === 1}
              className="mt-1 rounded-lg px-3 py-2 text-sm text-[#777168] hover:bg-[#f3efe8] disabled:cursor-not-allowed disabled:opacity-30"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addPoint}
        className="mt-4 text-sm font-medium text-[#8a6f47] hover:text-[#2c2925]"
      >
        + Add Point
      </button>
    </div>
  );
}