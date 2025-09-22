// components/UserManager.tsx
import { useState, useEffect, Fragment } from "react";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { childManager } from "@/utils/childManager";


interface ChildData {
  id: string;
  name: string;
  surname: string;
  age: number;
}

interface UserData {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  status: string;
  address?: string;
  houseNumber?: string;
  apartmentNumber?: string;
  city?: string;
  postalCode?: string;
  phoneNumber?: string;
  children: ChildData[];
  registrationDate: string;
}

export default function UserManager() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // form fields
  const [formName, setFormName] = useState("");
  const [formSurname, setFormSurname] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<"parent" | "admin">("parent");
  const [formStatus, setFormStatus] = useState<"active" | "pending" | "inactive">("pending");
  const [formAddress, setFormAddress] = useState("");
  const [formHouse, setFormHouse] = useState("");
  const [formApartment, setFormApartment] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formPostal, setFormPostal] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formChildren, setFormChildren] = useState<ChildData[]>([]);
  const [newChildName, setNewChildName] = useState("");
  const [newChildSurname, setNewChildSurname] = useState("");
  const [newChildAge, setNewChildAge] = useState<number>(0);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);


  const loadUsers = async () => {
  setLoading(true);
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const usersRaw = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Dla każdego użytkownika z rolą 'parent' – znajdź dzieci
    const users = await Promise.all(
      usersRaw.map(async user => {
        if (user.role === "parent") {
          const childrenSnap = await getDocs(
            query(collection(db, "children"), where("parentId", "==", user.id))
          );
          const children = childrenSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          return { ...user, children };
        } else {
          return { ...user, children: [] }; // brak dzieci dla admina
        }
      })
    );

    setAllUsers(users);
  } catch (err) {
    console.error("loadUsers error:", err);
    toast({ title: "Błąd", description: "Nie udało się załadować użytkowników.", variant: "destructive" });
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = allUsers.filter(u => {
    const t = searchTerm.toLowerCase();
    const ok =
      u?.name?.toLowerCase().includes(t) ||
      u?.surname?.toLowerCase().includes(t) ||
      u?.email?.toLowerCase().includes(t);
    if (!ok) return false;
    if (currentTab === "all") return true;
    if (currentTab === "parents") return u.role === "parent";
    if (currentTab === "admins") return u.role === "admin";
    if (currentTab === "active") return u.status === "active";
    if (currentTab === "pending") return u.status === "pending";
    return true;
  });

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openEdit = (u: UserData) => {
    setSelectedUser(u);
    setFormName(u.name);
    setFormSurname(u.surname);
    setFormEmail(u.email);
    setFormRole(u.role as any);
    setFormStatus(u.status as any);
    setFormAddress(u.address || "");
    setFormHouse(u.houseNumber || "");
    setFormApartment(u.apartmentNumber || "");
    setFormCity(u.city || "");
    setFormPostal(u.postalCode || "");
    setFormPhone(u.phoneNumber || "");
    setFormChildren(u.children);
    setIsEditOpen(true);
  };

  const saveUser = async () => {
  if (!selectedUser) return;

  try {
    // 1. Zapisz dane użytkownika do kolekcji "users"
   await updateDoc(doc(db, "users", selectedUser.id), {
      name: formName ?? "",
      surname: formSurname ?? "",
      email: formEmail ?? "",
      role: formRole ?? "parent",
      status: formStatus ?? "pending",
      address: formAddress ?? "",
      houseNumber: formHouse ?? "",
      apartmentNumber: formApartment ?? "",
      city: formCity ?? "",
      postalCode: formPostal ?? "",
      phoneNumber: formPhone ?? "",
      updatedAt: new Date(),
    });

    // 2. Przejdź przez wszystkie dzieci
    await Promise.all(
      formChildren.map(async (child) => {
        const isNew = child.id.includes("-new-");

        const childData = {
          name: child.name,
          surname: child.surname,
          age: child.age,
          parentId: selectedUser.id,
          updatedAt: new Date(),
        };

        if (isNew) {
          // Nowe dziecko – dodaj do kolekcji "children"
          await addDoc(collection(db, "children"), {
            ...childData,
            createdAt: new Date(),
          });
        } else {
          // Istniejące dziecko – zaktualizuj wpis w "children"
          await updateDoc(doc(db, "children", child.id), childData);
        }
      })
    );

    toast({ title: "Zapisano", description: "Dane użytkownika i dzieci zapisane." });
    setIsEditOpen(false);
    loadUsers(); // Odśwież listę

    } catch (error) {
      console.error("saveUser error:", error);
      toast({ title: "Błąd", description: "Nie udało się zapisać użytkownika.", variant: "destructive" });
    }
  };


  // remove locally only
  const deleteChildFromForm = (cid: string) =>
    setFormChildren(prev => prev.filter(c => c.id !== cid));

  // prevent deletion if still in a group
  const handleDeleteChild = async (cid: string) => {
    const groupsSnap = await getDocs(collection(db, "groups"));
    const inGroup = groupsSnap.docs.some(g =>
      Array.isArray(g.data().children) &&
      (g.data().children as string[]).includes(cid)
    );
    if (inGroup) {
      toast({ title: "Nie można usunąć", description: "Usuń z grupy najpierw.", variant: "destructive" });
      return;
    }
    if (!confirm("Usuń dziecko na stałe?")) return;
    await deleteDoc(doc(db, "children", cid));
    await childManager.deleteChild(cid);
    toast({ title: "Usunięto dziecko", description: "Dziecko zostało usunięte." });
    deleteChildFromForm(cid);
    toast({ title: "Usunięto dziecko" });
    setIsEditOpen(false);
    loadUsers();
  };

  const addChild = () => {
    if (!newChildName || !newChildSurname || newChildAge <= 0) return;
    setFormChildren(prev => [
      ...prev,
      { id: `${selectedUser!.id}-new-${Date.now()}`, name: newChildName, surname: newChildSurname, age: newChildAge },
    ]);
    setNewChildName("");
    setNewChildSurname("");
    setNewChildAge(0);
  };

  if (loading) return <div>Ładowanie…</div>;

  return (
    <div className="space-y-6">
      <Helmet><title>User Management</title></Helmet>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <Input
            placeholder="Szukaj..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <Button onClick={() => console.log(filtered)}>asd</Button>
     
        <TabsList className="grid grid-cols-5">
          {["all","parents","admins","active","pending"].map(v => (
            <TabsTrigger key={v} value={v}>
              {v.charAt(0).toUpperCase()+v.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={currentTab}>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead/>
                  <TableHead>Imię</TableHead>
                  <TableHead>Nazwisko</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rola</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => (
                  <Fragment key={u.id}>
                    <TableRow>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => toggleRow(u.id)}>
                          {expandedRows[u.id] ? <FaChevronUp/> : <FaChevronDown/>}
                        </Button>
                      </TableCell>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.surname}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Badge>{u.role}</Badge></TableCell>
                      <TableCell><Badge>{u.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="icon" onClick={() => openEdit(u)}>
                          <FaEdit/>
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={async () => {
                            await deleteDoc(doc(db, "users", u.id));
                            toast({ title: "Usunięto", description: "Użytkownik usunięty." });
                            loadUsers();
                          }}
                        >
                          <FaTrash/>
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRows[u.id] && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-gray-50">
                          <div className="p-4">
                            <h4 className="font-semibold">Dzieci:</h4>
                            {u.children.length ? (
                              <ul className="list-disc ml-6">
                                {u.children.map(c => (
                                  <li key={c.id}>
                                    {c.name} {c.surname}, {c.age} lat
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500">Brak dzieci.</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edycja użytkownika</DialogTitle>
            <DialogDescription>Zaktualizuj dane konta i dzieci</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* account fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Imię</Label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} />
              </div>
              <div>
                <Label>Nazwisko</Label>
                <Input value={formSurname} onChange={e => setFormSurname(e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Email</Label>
                <Input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
              </div>
              <div>
                <Label>Rola</Label>
                <select value={formRole} onChange={e => setFormRole(e.target.value as any)} className="w-full rounded border px-2 py-1">
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select value={formStatus} onChange={e => setFormStatus(e.target.value as any)} className="w-full rounded border px-2 py-1">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* address */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ulica i numer</Label>
                <Input placeholder="Południowa 21B" value={formAddress} onChange={e => setFormAddress(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Input placeholder="Nr domu" value={formHouse} onChange={e => setFormHouse(e.target.value)} />
                <Input placeholder="Nr mieszkania" value={formApartment} onChange={e => setFormApartment(e.target.value)} />
              </div>
              <div>
                <Label>Miasto</Label>
                <Input value={formCity} onChange={e => setFormCity(e.target.value)} />
              </div>
              <div>
                <Label>Kod pocztowy</Label>
                <Input value={formPostal} onChange={e => setFormPostal(e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Telefon</Label>
                <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} />
              </div>
            </div>

            {/* Children management */}
            <div>
              <h4 className="font-semibold">Dzieci</h4>
              {formChildren.map((c, idx) => (
                <div key={c.id} className="grid grid-cols-4 items-center gap-2 py-1">
                  <Input
                    value={c.name}
                    onChange={e => {
                      const updated = [...formChildren];
                      updated[idx] = { ...updated[idx], name: e.target.value };
                      setFormChildren(updated);
                    }}
                    placeholder="Imię"
                  />
                  <Input
                    value={c.surname}
                    onChange={e => {
                      const updated = [...formChildren];
                      updated[idx] = { ...updated[idx], surname: e.target.value };
                      setFormChildren(updated);
                    }}
                    placeholder="Nazwisko"
                  />
                  <Input
                    value={c.age.toString()}
                    type="number"
                    onChange={e => {
                      const updated = [...formChildren];
                      updated[idx] = { ...updated[idx], age: Number(e.target.value) };
                      setFormChildren(updated);
                    }}
                    placeholder="Wiek"
                  />
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteChildFromForm(c.id)}
                      title="Usuń z formularza"
                    >
                      <FaTrash />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteChild(c.id)}
                      title="Usuń na stałe"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Add new child */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <Input
                  placeholder="Imię"
                  value={newChildName}
                  onChange={e => setNewChildName(e.target.value)}
                />
                <Input
                  placeholder="Nazwisko"
                  value={newChildSurname}
                  onChange={e => setNewChildSurname(e.target.value)}
                />
                <Input
                  placeholder="Wiek"
                  type="number"
                  value={newChildAge > 0 ? newChildAge.toString() : ""}
                  onChange={e => setNewChildAge(Number(e.target.value))}
                />
              </div>
              <Button variant="outline" className="mt-2" onClick={addChild}>
                <FaPlus className="mr-2" /> Dodaj dziecko
              </Button>
            </div>

          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Anuluj</Button>
            <Button onClick={saveUser}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
