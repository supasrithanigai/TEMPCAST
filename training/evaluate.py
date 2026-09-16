"""
TEMPESTCAST Model Evaluation & Baseline Comparison Script
Generates comprehensive verification statistics comparing AI vs Advection vs Persistence.
"""

from evaluation.metrics import VerificationEvaluator

def run_evaluation():
    evaluator = VerificationEvaluator()
    summary = evaluator.get_comparison_summary()

    print("=" * 70)
    print("TEMPESTCAST VERIFICATION REPORT: LEAD-TIME COMPARISON")
    print("=" * 70)

    for item in summary:
        print(f"\nModel: {item['model_name']} ({item['model_type']})")
        print(f"Overall CSI: {item['overall_csi']:.3f} | Overall POD: {item['overall_pod']:.3f} | Overall FAR: {item['overall_far']:.3f} | Overall Brier: {item['overall_brier']:.3f}")
        print(f"{'Lead Time':<12}{'CSI':<8}{'POD':<8}{'FAR':<8}{'Brier':<8}")
        for m in item["metrics_by_lead_time"]:
            print(f"+{m['lead_time_minutes']} min{'':<6}{m['csi']:<8.3f}{m['pod']:<8.3f}{m['far']:<8.3f}{m['brier']:<8.3f}")

if __name__ == "__main__":
    run_evaluation()
