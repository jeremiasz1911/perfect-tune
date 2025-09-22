import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { addDoc, collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

// Zmieniony interfejs dla dziecka – age jako number
interface ChildData {
  id: string;
  name: string;
  surname: string;
  age: number;
}

const ChildrenManager = () => {
  const [children, setChildren] = useState<ChildData[]>([]);
  const [addingChild, setAddingChild] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [newChildName, setNewChildName] = useState("");
  const [newChildSurname, setNewChildSurname] = useState("");
  const [newChildAge, setNewChildAge] = useState("");
  const [editChildName, setEditChildName] = useState("");
  const [editChildSurname, setEditChildSurname] = useState("");
  const [editChildAge, setEditChildAge] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  // Funkcja pobierająca dzieci zalogowanego rodzica z kolekcji "children"
  const fetchChildren = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "children"),
        where("parentId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const childrenList: ChildData[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          surname: data.surname,
          age: data.age,
        };
      });
      setChildren(childrenList);
    } catch (error) {
      console.error("Error fetching children:", error);
      toast({
        title: "Error",
        description: "Failed to load children. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [user]);

  const resetNewChildForm = () => {
    setNewChildName("");
    setNewChildSurname("");
    setNewChildAge("");
    setAddingChild(false);
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newChildName || !newChildSurname || !newChildAge) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields for the new child.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add a child.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Dodaj dziecko do kolekcji "children" z parentId
      await addDoc(collection(db, "children"), {
        name: newChildName,
        surname: newChildSurname,
        age: parseInt(newChildAge),
        parentId: user.uid,
        createdAt: new Date(),
      });
      
      toast({
        title: "Child Added",
        description: "The child has been added successfully.",
      });
      
      resetNewChildForm();
      fetchChildren(); // odśwież listę dzieci
    } catch (error) {
      console.error("Error adding child:", error);
      toast({
        title: "Error",
        description: "Failed to add child. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditChild = (child: ChildData) => {
    setEditingChildId(child.id);
    setEditChildName(child.name);
    setEditChildSurname(child.surname);
    setEditChildAge(child.age.toString());
  };

  const cancelEditChild = () => {
    setEditingChildId(null);
  };

  const saveEditChild = async (childId: string) => {
    if (!editChildName || !editChildSurname || !editChildAge) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Aktualizuj dane dziecka w Firestore
      const childRef = doc(db, "children", childId);
      await updateDoc(childRef, {
        name: editChildName,
        surname: editChildSurname,
        age: parseInt(editChildAge),
      });
      
      toast({
        title: "Child Updated",
        description: "The child's information has been updated successfully.",
      });
      setEditingChildId(null);
      fetchChildren(); // odśwież listę dzieci
    } catch (error) {
      console.error("Error updating child:", error);
      toast({
        title: "Error",
        description: "Failed to update child. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveChild = async (childId: string) => {
    if (!confirm("Are you sure you want to remove this child?")) {
      return;
    }

    setIsLoading(true);
    try {
      // Usuń dziecko z kolekcji "children"
      await deleteDoc(doc(db, "children", childId));
      
      toast({
        title: "Child Removed",
        description: "The child has been removed successfully.",
      });
      fetchChildren(); // odśwież listę dzieci
    } catch (error) {
      console.error("Error removing child:", error);
      toast({
        title: "Error",
        description: "Failed to remove child. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Children</h3>
        {!addingChild && (
          <Button 
            onClick={() => setAddingChild(true)} 
            className="text-sm"
            size="sm"
          >
            <FaPlus className="mr-2" size={12} />
            Add Child
          </Button>
        )}
      </div>

      {children.length === 0 && !addingChild ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-neutral-500 text-center">No children added yet.</p>
            <div className="flex justify-center mt-4">
              <Button 
                onClick={() => setAddingChild(true)} 
                className="text-sm"
                size="sm"
              >
                <FaPlus className="mr-2" size={12} />
                Add Your First Child
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Form for adding a new child */}
          {addingChild && (
            <Card className="bg-neutral-50">
              <CardContent className="pt-6">
                <form onSubmit={handleAddChild}>
                  <h4 className="font-medium mb-4">Add New Child</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="new-child-name">First Name</Label>
                      <Input
                        id="new-child-name"
                        value={newChildName}
                        onChange={(e) => setNewChildName(e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-child-surname">Last Name</Label>
                      <Input
                        id="new-child-surname"
                        value={newChildSurname}
                        onChange={(e) => setNewChildSurname(e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-child-age">Age</Label>
                      <Input
                        id="new-child-age"
                        value={newChildAge}
                        onChange={(e) => setNewChildAge(e.target.value)}
                        type="number"
                        min="1"
                        max="18"
                        placeholder="Age"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetNewChildForm}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding Child...
                        </div>
                      ) : (
                        <>Add Child</>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* List of children */}
          {children.map((child) => (
            <Card key={child.id} className="overflow-hidden">
              <CardContent className="p-4">
                {editingChildId === child.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`edit-name-${child.id}`}>First Name</Label>
                      <Input
                        id={`edit-name-${child.id}`}
                        value={editChildName}
                        onChange={(e) => setEditChildName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-surname-${child.id}`}>Last Name</Label>
                      <Input
                        id={`edit-surname-${child.id}`}
                        value={editChildSurname}
                        onChange={(e) => setEditChildSurname(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-age-${child.id}`}>Age</Label>
                      <Input
                        id={`edit-age-${child.id}`}
                        value={editChildAge}
                        onChange={(e) => setEditChildAge(e.target.value)}
                        type="number"
                        min="1"
                        max="18"
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEditChild}
                        disabled={isLoading}
                      >
                        <FaTimes className="mr-2" size={12} />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveEditChild(child.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </div>
                        ) : (
                          <>
                            <FaSave className="mr-2" size={12} />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-light text-white rounded-full flex items-center justify-center font-bold mr-4">
                        {child.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{child.name} {child.surname}</h4>
                        <p className="text-sm text-neutral-500">Age: {child.age}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditChild(child)}
                        className="text-neutral-500 hover:text-primary"
                      >
                        <FaEdit size={16} />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveChild(child.id)}
                        className="text-neutral-500 hover:text-red-500"
                      >
                        <FaTrash size={16} />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="border-t border-neutral-200 pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="parent-email">Email Address</Label>
            <Input
              id="parent-email"
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-neutral-50"
            />
            <p className="text-xs text-neutral-500 mt-1">To change your email, please contact support.</p>
          </div>
          
          <div>
            <Label htmlFor="parent-password">Password</Label>
            <Input
              id="parent-password"
              type="password"
              value="••••••••"
              disabled
              className="bg-neutral-50"
            />
            <div className="flex justify-end mt-1">
              <Button variant="link" size="sm" className="text-xs h-auto p-0">
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildrenManager;
