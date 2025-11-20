import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ItemCard from "./ItemCard";

interface DraggableItemCardProps {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  type: string;
  metadata?: any;
  category_id?: string | null;
  onDelete: () => void;
  onUpdate: () => void;
}

const DraggableItemCard = (props: DraggableItemCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ItemCard {...props} />
    </div>
  );
};

export default DraggableItemCard;
