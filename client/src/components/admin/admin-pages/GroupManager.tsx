// src/components/admin/GroupManager.tsx
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { EnhancedChildrenSelector, IChild } from "../EnhancedChildrenSelector";

interface GroupData {
  id: string;
  name: string;
  description?: string;
  children: string[];    // array of child IDs
}

interface RawParent {
  id: string;
  name: string;
  surname: string;
  children?: Array<{
    id: string;
    name: string;
    surname: string;
    age: number;
  }>;
}

export default function GroupManager() {
  const { toast } = useToast();

  const [groups, setGroups] = useState<GroupData[]>([]);
  const [allChildren, setAllChildren] = useState<IChild[]>([]);
  const [groupedByParent, setGroupedByParent] = useState<Record<string, IChild[]>>({});

  // modal/form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupData | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  // expand cards
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. load groups
        const groupsSnap = await getDocs(collection(db, "groups"));
        const grpData = groupsSnap.docs.map(d => ({
          id: d.id,
          ...(d.data() as any)
        })) as GroupData[];
        setGroups(grpData);

        // 2. load all children from global "children" collection
            const childrenSnap = await getDocs(collection(db, "children"));
            const kids: IChild[] = [];
            const byParent: Record<string, IChild[]> = {};

            childrenSnap.docs.forEach(docSnap => {
              const data = docSnap.data() as any;
              const key = data.parentName || `${data.parentFirstName || ""} ${data.parentSurname || ""}`.trim() || "Bez rodzica";

              const child: IChild = {
                id: docSnap.id,
                name: data.name,
                surname: data.surname,
                age: data.age,
                parentName: key,
                group: key
              };

              kids.push(child);

              // Grupowanie po rodzicu
              byParent[key] = byParent[key] || [];
              byParent[key].push(child);
            });

            setAllChildren(kids);
            setGroupedByParent(byParent);

      } catch (err) {
        console.error(err);
        toast({ title: "Błąd", description: "Nie udało się wczytać grup/dzieci.", variant: "destructive" });
      }
    }
    fetchData();
  }, [toast]);

  const openNew = () => {
    setEditingGroup(null);
    setName("");
    setDescription("");
    setSelectedChildren([]);
    setIsModalOpen(true);
  };

  const openEdit = (g: GroupData) => {
    setEditingGroup(g);
    setName(g.name);
    setDescription(g.description || "");
    setSelectedChildren(g.children);
    setIsModalOpen(true);
  };

  const saveGroup = async () => {
    if (!name.trim()) {
      return toast({ title: "Błąd", description: "Nazwa wymagana.", variant: "destructive" });
    }
    try {
      if (editingGroup) {
        await updateDoc(doc(db, "groups", editingGroup.id), {
          name,
          description,
          children: selectedChildren
        });
        toast({ title: "Zaktualizowano", description: "Grupa zaktualizowana." });
      } else {
        await addDoc(collection(db, "groups"), {
          name,
          description,
          children: selectedChildren
        });
        toast({ title: "Dodano", description: "Nowa grupa utworzona." });
      }
      setIsModalOpen(false);
      // refresh
      const snap = await getDocs(collection(db, "groups"));
      setGroups(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as GroupData)));
    } catch {
      toast({ title: "Błąd", description: "Nie udało się zapisać.", variant: "destructive" });
    }
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("Na pewno?")) return;
    await deleteDoc(doc(db, "groups", id));
    setGroups(gs => gs.filter(g => g.id !== id));
    toast({ title: "Usunięto", description: "Grupa usunięta." });
  };

  const toggleExpand = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Group Manager</h1>
        <Button onClick={openNew}><FaPlus className="mr-1" /> Nowa grupa</Button>
      </div>

      <div className="grid gap-4">
        {groups.map(g => (
          <Card key={g.id} onClick={() => toggleExpand(g.id)} className="cursor-pointer hover:shadow">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{g.name}</CardTitle>
                  {g.description && <CardDescription>{g.description}</CardDescription>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); openEdit(g); }}>
                    <FaEdit />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={e => { e.stopPropagation(); deleteGroup(g.id); }}>
                    <FaTrash />
                  </Button>
                </div>
              </div>
            </CardHeader>
             {expandedGroups.has(g.id) && (
              <CardContent className="bg-gray-50">
                
                <ul className="divide-y">
                  {g.children.map(cid => {
                    const c = allChildren.find(x => x.id === cid);
                    console.log(`Child ${cid}:`, c);
                    
                    if (!c) return <li key={cid} className="py-2 text-sm text-red-500">Brak danych dla dziecka {cid}</li>;
                    return (
                      <li key={cid} className="py-2">
                        <div className="font-medium">{c.name} {c.surname}</div>
                        <div className="text-sm text-gray-600">Wiek: {c.age ?? "-"}, Rodzic: {c.group}</div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Edytuj grupę" : "Nowa grupa"}</DialogTitle>
            <DialogDescription>
              {editingGroup ? "Aktualizuj grupę" : "Utwórz nową grupę"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nazwa</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <Label>Opis</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Wybierz dzieci (po rodzicach)</Label>
              <EnhancedChildrenSelector
                groupedChildren={groupedByParent}
                selected={selectedChildren}
                onChange={setSelectedChildren}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Anuluj</Button>
            <Button onClick={saveGroup}>{editingGroup ? "Zapisz" : "Utwórz"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
