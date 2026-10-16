import { pluralPods } from '../../utils/format';

// "Recommended action (DEMO)" card on the Summary (O5), Full report (O7) and supervisor detail.
// The text comes from the disease table (listDiseases), never from AI.
// actions: from getRecommendedActions(summary, diseases)
// showNames: starts each action with "Black pod rot (1 pod):". O5 only does this when more than
//            one disease was found; O7 always does.
// badge: text of the pill next to the heading (supervisor detail: "DEMO · to verify with LKM")
function RecommendedActionCard({ actions, showNames = false, badge = 'DEMO' }) {
  return (
    <section
      aria-labelledby="recommended-action-heading"
      className="flex flex-col gap-1.5 rounded-xl bg-primary-soft p-3.5"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="recommended-action-heading" className="text-base font-bold text-primary">
          Recommended action
        </h2>
        <span className="rounded-full bg-sev-medium-bg px-2 py-0.5 text-[11px] font-bold text-sev-medium-text">
          {badge}
        </span>
      </div>
      {actions.map((item) => (
        <p key={item.code} className="leading-relaxed">
          {showNames && (
            <b>
              {item.name} ({pluralPods(item.count)}):{' '}
            </b>
          )}
          {item.action}
        </p>
      ))}
    </section>
  );
}

export default RecommendedActionCard;
