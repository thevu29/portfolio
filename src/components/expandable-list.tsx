import { ChevronDownIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ExpandableListProps {
  items: string[];
  showLabel?: string;
  hideLabel?: string;
}

/**
 * Bullet list behind a "Show details" toggle (Base UI Collapsible). Height is
 * animated in CSS via --collapsible-panel-height; hiddenUntilFound keeps the
 * text findable with Ctrl+F while collapsed.
 */
export function ExpandableList({
  items,
  showLabel = "Show details",
  hideLabel = "Hide details",
}: ExpandableListProps) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="group/trigger text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors">
        <span className="group-data-[panel-open]/trigger:hidden">{showLabel}</span>
        <span className="hidden group-data-[panel-open]/trigger:inline">{hideLabel}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-3.5 transition-transform duration-300 group-data-[panel-open]/trigger:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent
        hiddenUntilFound
        className="h-(--collapsible-panel-height) overflow-hidden transition-[height,opacity] duration-300 ease-out data-[ending-style]:h-0 data-[ending-style]:opacity-0 data-[starting-style]:h-0 data-[starting-style]:opacity-0 motion-reduce:transition-none"
      >
        <ul className="text-muted-foreground text-sm leading-relaxed">
          {items.map((item) => (
            <li
              key={item}
              className="before:text-subtle relative mt-2 pl-4 before:absolute before:left-0 before:content-['–'] first:mt-3"
            >
              {item}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
