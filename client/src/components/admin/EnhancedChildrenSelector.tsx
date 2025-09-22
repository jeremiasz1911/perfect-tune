import React, { useState, useEffect, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface IChild {
  id: string;
  name: string;
  surname?: string;
  age?: number;
  group: string;
  parentName: string;
}

interface EnhancedChildrenSelectorProps {
  selected: string[];
  onChange: (newSelected: string[]) => void;
}

export function EnhancedChildrenSelector({ selected, onChange }: EnhancedChildrenSelectorProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"group" | "parent">("group");
  const [groupedByGroup, setGroupedByGroup] = useState<Record<string, IChild[]>>({});
  const [groupedByParent, setGroupedByParent] = useState<Record<string, IChild[]>>({});

  // Fetch parents & groups data
 useEffect(() => {
  async function fetchData() {
    // 1️⃣ Pobierz rodziców
    const userSnap = await getDocs(collection(db, "users"));
    const parentsMap: Record<string, string> = {};
    userSnap.docs.forEach(userDoc => {
      const u = userDoc.data() as any;
      const parentName = u.name && u.surname
        ? `${u.name} ${u.surname}`.trim()
        : (u.email || userDoc.id);
      parentsMap[userDoc.id] = parentName;
    });

    // 2️⃣ Pobierz dzieci
    const childrenSnap = await getDocs(collection(db, "children"));
    const childMap: Record<string, IChild> = {};
    childrenSnap.docs.forEach(childDoc => {
      const c = childDoc.data() as any;
      childMap[childDoc.id] = {
        id: childDoc.id,
        name: c.name,
        surname: c.surname || "",
        group: "",
        parentName: parentsMap[c.parentId] || "Nieznany rodzic"
      };
    });

    // 3️⃣ Grupuj po rodzicu
    const byParent: Record<string, IChild[]> = {};
    Object.values(childMap).forEach(child => {
      const key = child.parentName;
      if (!byParent[key]) byParent[key] = [];
      byParent[key].push(child);
    });

    // 4️⃣ Grupuj po grupach
    const groupSnap = await getDocs(collection(db, "groups"));
    const byGroup: Record<string, IChild[]> = {};
    groupSnap.docs.forEach(groupDoc => {
      const grp = groupDoc.data() as any;
      const groupName = grp.name || groupDoc.id;
      (grp.children || []).forEach((cid: string) => {
        const ch = childMap[cid];
        if (ch) {
          const entry = { ...ch, group: groupName };
          if (!byGroup[groupName]) byGroup[groupName] = [];
          byGroup[groupName].push(entry);
        }
      });
    });

    setGroupedByParent(byParent);
    setGroupedByGroup(byGroup);
  }
  fetchData();
}, []);


  // filter functions
  const filteredByGroup = useMemo(() => {
    const res: Record<string, IChild[]> = {};
    Object.entries(groupedByGroup).forEach(([key, list]) => {
      const matches = list.filter(c =>
        `${c.name} ${c.surname || ''}`.toLowerCase().includes(search.toLowerCase())
      );
      if (matches.length) res[key] = matches;
    });
    return res;
  }, [groupedByGroup, search]);

  const filteredByParent = useMemo(() => {
    const res: Record<string, IChild[]> = {};
    Object.entries(groupedByParent).forEach(([key, list]) => {
      const matches = list.filter(c =>
        `${c.name} ${c.surname || ''}`.toLowerCase().includes(search.toLowerCase())
      );
      if (matches.length) res[key] = matches;
    });
    return res;
  }, [groupedByParent, search]);

  const data = tab === "group" ? filteredByGroup : filteredByParent;

  // selection helpers
  const isGroupChecked = (key: string) => data[key].every(c => selected.includes(c.id));
  const toggleGroup = (key: string, checked: boolean) => {
    const ids = data[key].map(c => c.id);
    let next = [...selected];
    if (checked) next = Array.from(new Set([...next, ...ids]));
    else next = next.filter(id => !ids.includes(id));
    onChange(next);
  };
  const toggleChild = (id: string, checked: boolean) => {
    let next = [...selected];
    if (checked) next.push(id);
    else next = next.filter(x => x !== id);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search children..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-2"
      />
      <Tabs defaultValue="group" value={tab} onValueChange={v => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="group">By Group</TabsTrigger>
          <TabsTrigger value="parent">By Parent</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="p-0 space-y-4">
          {Object.entries(data).map(([key, children]) => (
            <Collapsible key={key} defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-gray-100 rounded-md hover:bg-gray-200">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={isGroupChecked(key)}
                    onCheckedChange={v => toggleGroup(key, Boolean(v))}
                  />
                  <span className="font-semibold">{key}</span>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-2 pl-8 space-y-2">
                {children.map(child => (
                  <label key={child.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selected.includes(child.id)}
                      onCheckedChange={v => toggleChild(child.id, Boolean(v))}
                    />
                    <span>{child.name} {child.surname}</span>
                  </label>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
