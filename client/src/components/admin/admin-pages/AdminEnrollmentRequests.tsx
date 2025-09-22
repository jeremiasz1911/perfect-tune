import { useEffect, useMemo, useState } from "react";
import {
  listEnrollmentRequests,
  approveEnrollmentRequest,
  rejectEnrollmentRequest,
  approveUnenrollRequest,
  getUsersByIds,
  getChildrenByIds,
  getClassesByIds,
} from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

import { db } from "@/lib/firebase";
import { doc, getDoc, getDocs, query, collection, where } from "firebase/firestore";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RequestOp = "enroll" | "unenroll";

type EnrollmentRequest = {
  id: string;
  status: "pending" | "approved" | "rejected";
  parentId: string;
  childId: string;
  classId?: string;
  lessonId?: string;
  classTitle?: string;
  createdAt?: any;
  note?: string;
  reason?: string;
  op?: RequestOp;
  action?: RequestOp;
  enrollmentId?: string;
  effectiveFrom?: any;
};

type Parent = {
  id: string; displayName?: string; firstName?: string; lastName?: string; email?: string; phone?: string;
};
type Child = {
  id: string; firstName?: string; lastName?: string; name?: string; surname?: string; parentId?: string;
  dob?: any; birthDate?: any;
};
type Class = {
  id: string; title?: string; dayOfWeek?: number | string; startTime?: string; endTime?: string; location?: string;
};

type EnrichedItem = { request: EnrollmentRequest; parent?: Parent; child?: Child; klass?: Class };

type LessonDetails = {
  id: string;
  title: string;
  instructor?: string;
  scheduleText?: string;
  location?: string;
  capacity?: number;
  ageRange?: string;
  billing?: { model?: "monthly" | "per_lesson"; priceMonthly?: number; pricePerLesson?: number; dueDays?: number; billingDay?: number; };
  participants: Array<{ childId: string; childName: string; parentName?: string; parentId?: string }>;
};

const WEEKDAY_PL = ["Pn","Wt","Śr","Cz","Pt","Sb","Nd"];
const toDateSafe = (ts:any) => ts?.toDate?.() ?? (ts ? new Date(ts) : undefined);
const formatDateTime = (d?:Date) => d ? d.toLocaleString("pl-PL",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}) : "";
const initials = (name?:string) => {
  if (!name) return "??";
  const parts = name.split(" ").filter(Boolean);
  return parts.length === 1 ? parts[0].slice(0,2).toUpperCase() : (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
};
const fullNameFromParent = (p?:Parent) => p?.displayName || [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim();
const fullNameFromChild  = (c?:Child)  => c?.name || [c?.firstName, c?.lastName || c?.surname].filter(Boolean).join(" ").trim();
const ageFromDOB = (dobLike:any) => {
  const d = toDateSafe(dobLike); if (!d) return;
  const t = new Date(); let a = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
  return a;
};
const classInfo = (k?:Class) => {
  if (!k) return "";
  const title = k.title || k.id;
  let when = "";
  if (k.dayOfWeek || k.startTime) {
    let dayTxt = "";
    if (typeof k.dayOfWeek === "number") dayTxt = WEEKDAY_PL[(k.dayOfWeek - 1 + 7) % 7] ?? String(k.dayOfWeek);
    else if (typeof k.dayOfWeek === "string") dayTxt = k.dayOfWeek;
    const time = k.startTime && k.endTime ? `${k.startTime}–${k.endTime}` : (k.startTime || "");
    const loc = k.location ? `, ${k.location}` : "";
    when = [dayTxt, time].filter(Boolean).join(" ") + loc;
  }
  return when ? `${title} • ${when}` : title;
};

const resolveOp = (r: EnrollmentRequest): RequestOp => {
  const raw = r.op ?? r.action;
  if (raw === "unenroll") return "unenroll";
  if (raw === "enroll") return "enroll";
  if (r.enrollmentId) return "unenroll";
  return "enroll";
};
const resolveClassId = (r: EnrollmentRequest) => r.classId ?? r.lessonId ?? "";

const AdminEnrollmentRequests = ({ adminId }: { adminId: string }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterOp, setFilterOp] = useState<"all" | RequestOp>("all");

  // modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState<LessonDetails | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const reqs: EnrollmentRequest[] = await listEnrollmentRequests("pending");
      if (!reqs?.length) { setItems([]); return; }

      const parentIds = Array.from(new Set(reqs.map(r => r.parentId).filter(Boolean)));
      const childIds  = Array.from(new Set(reqs.map(r => r.childId).filter(Boolean)));
      const classIds  = Array.from(new Set(reqs.map(r => resolveClassId(r)).filter(Boolean)));

      const [parents, children, classes] = await Promise.all([
        getUsersByIds(parentIds),
        getChildrenByIds(childIds),
        getClassesByIds(classIds),
      ]);

      const parentMap = new Map(parents.map(p => [p.id, p]));
      const childMap  = new Map(children.map(c => [c.id, c]));
      const classMap  = new Map(classes.map(k => [k.id, k]));

      setItems(reqs.map(r => {
        const cid = resolveClassId(r);
        return {
          request: r,
          parent: parentMap.get(r.parentId),
          child: childMap.get(r.childId),
          klass: cid ? classMap.get(cid) : undefined,
        };
      }));
    } catch (e:any) {
      toast({ title: "Błąd ładowania", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const approve = async (r: EnrollmentRequest) => {
    const op = resolveOp(r);
    try {
      if (op === "unenroll") {
        await approveUnenrollRequest({ requestId: r.id, adminId });
        toast({ title: "Wypisano", description: "Zlecenie wypisania zostało zatwierdzone." });
      } else {
        await approveEnrollmentRequest({ requestId: r.id, adminId });
        toast({ title: "Zatwierdzono", description: "Utworzono zapis i wystawiono fakturę." });
      }
      await load();
    } catch (e:any) {
      toast({ title: "Nie można zatwierdzić", description: String(e?.message || e), variant: "destructive" });
    }
  };

  const reject = async (r: EnrollmentRequest) => {
    const op = resolveOp(r);
    try {
      await rejectEnrollmentRequest({
        requestId: r.id,
        adminId,
        reason: op === "unenroll" ? "Odrzucono prośbę o wypisanie" : "Odrzucono prośbę o zapis",
      });
      toast({ title: "Odrzucono" });
      await load();
    } catch (e:any) {
      toast({ title: "Nie można odrzucić", description: String(e?.message || e), variant: "destructive" });
    }
  };

  const filtered = useMemo(() => {
    if (filterOp === "all") return items;
    return items.filter(x => resolveOp(x.request) === filterOp);
  }, [items, filterOp]);

  // ======== MODAL: ładowanie szczegółów lekcji + rosteru ========

  const scheduleToText = (lessonData: any): string => {
    const sc = lessonData?.schedule || {};
    const days = Array.isArray(sc.days) ? sc.days.join(", ") : "";
    const times = [sc.startTime, sc.endTime].filter(Boolean).join("–");
    return [days, times].filter(Boolean).join(" • ");
  };

  const classToText = (cls: Class | undefined): string => {
    if (!cls) return "";
    const day =
      typeof cls.dayOfWeek === "number"
        ? WEEKDAY_PL[(cls.dayOfWeek - 1 + 7) % 7] ?? String(cls.dayOfWeek)
        : (cls.dayOfWeek || "");
    const times = [cls.startTime, cls.endTime].filter(Boolean).join("–");
    return [day, times].filter(Boolean).join(" • ");
  };

  const openLessonDetails = async (lessonOrClassId: string) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      let title = "";
      let instructor = "";
      let location = "";
      let capacity: number | undefined = undefined;
      let ageRange = "";
      let billing: LessonDetails["billing"] = {};
      let scheduleText = "";
      let participantRefs: any[] = [];

      const lessonRef = doc(db, "lessons", lessonOrClassId);
      const lessonSnap = await getDoc(lessonRef);
      const activeStatuses = ["active", "approved", "ongoing"]; // dostosuj nazwy do swoich
      const enrSnap = await getDocs(
        query(
          collection(db, "enrollments"),
          where("classId", "==", lessonOrClassId),
          where("status", "in", activeStatuses)
        )
      );

       const now = new Date();
        const activeEnrs = enrSnap.docs
          .map(d => ({ id: d.id, ...(d.data() as any) }))
          .filter(e => {
            const end = e.endedAt?.toDate?.() ?? e.endDate?.toDate?.();
            return !end || end > now;
          });

        const uniqueChildIds = Array.from(new Set(activeEnrs.map(e => e.childId).filter(Boolean)));


      if (lessonSnap.exists()) {
        const d: any = lessonSnap.data();
        title = d?.title || d?.name || lessonOrClassId;
        instructor = d?.instructor || "";
        location = d?.location || "";
        capacity = typeof d?.capacity === "number" ? d.capacity : undefined;
        ageRange = d?.ageRange || "";
        billing = d?.billing || {};
        scheduleText = scheduleToText(d);
        participantRefs = Array.isArray(d?.participants) ? d.participants : [];
      } else {
        const classRef = doc(db, "classes", lessonOrClassId);
        const classSnap = await getDoc(classRef);
        if (!classSnap.exists()) {
          throw new Error("Nie znaleziono lekcji ani klasy o podanym ID.");
        }
        const k: any = classSnap.data();
        title = k?.title || lessonOrClassId;
        instructor = k?.instructor || "";
        location = k?.location || "";
        capacity = typeof k?.capacity === "number" ? k.capacity : undefined;
        ageRange = k?.ageRange || "";
        billing = k?.billing || {};
        scheduleText = classToText({ id: lessonOrClassId, ...k });
        participantRefs = Array.isArray(k?.participants) ? k.participants : [];
      }

      
      const participants: Array<{ childId: string; childName: string; parentName?: string; parentId?: string }> = [];
      for (const cid of uniqueChildIds) {
        const cSnap = await getDoc(doc(db, "children", cid));
        let childName = cid;
        let parentId: string | undefined;
        let parentName = "";

        if (cSnap.exists()) {
          const c: any = cSnap.data();
          childName = [c?.name, c?.surname].filter(Boolean).join(" ").trim() || cid;
          parentId = c?.parentId;
          if (parentId) {
            const pSnap = await getDoc(doc(db, "users", parentId));
            if (pSnap.exists()) {
              const p: any = pSnap.data();
              parentName =
                p?.fullName || [p?.name, p?.surname].filter(Boolean).join(" ").trim() || p?.displayName || "";
            }
          }
        }
        participants.push({ childId: cid, childName, parentId, parentName });
      }

      setDetails({
        id: lessonOrClassId,
        title,
        instructor,
        scheduleText,
        location,
        capacity,
        ageRange,
        billing,
        participants,
      });
    } catch (e:any) {
      setDetails(null);
      toast({ title: "Błąd", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Prośby (zapisy i wypisania)</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant={filterOp==="all"?"default":"outline"} onClick={()=>setFilterOp("all")}>Wszystkie</Button>
            <Button size="sm" variant={filterOp==="enroll"?"default":"outline"} onClick={()=>setFilterOp("enroll")}>Tylko zapisy</Button>
            <Button size="sm" variant={filterOp==="unenroll"?"default":"outline"} onClick={()=>setFilterOp("unenroll")}>Tylko wypisania</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <div className="text-sm text-neutral-500">Ładowanie…</div>}
          {!loading && filtered.length === 0 && <div className="text-sm text-neutral-500">Brak pasujących próśb.</div>}

          {!loading && filtered.map(({ request: r, parent, child, klass }) => {
            const op = resolveOp(r);
            const parentName = fullNameFromParent(parent) || r.parentId;
            const childName  = fullNameFromChild(child) || r.childId;
            const childAge   = ageFromDOB(child?.dob ?? child?.birthDate);
            const cls        = classInfo(klass) || r.classTitle || resolveClassId(r) || "";
            const created    = formatDateTime(toDateSafe(r.createdAt));
            const effective  = op === "unenroll" ? formatDateTime(toDateSafe(r.effectiveFrom)) : undefined;

            const lessonOrClassId = resolveClassId(r);

            return (
              <div key={r.id} className="border rounded-md p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{initials(parentName)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium">{parentName}</div>
                      <div className="text-neutral-500">
                        {parent?.email ?? "—"}{parent?.phone ? ` • ${parent.phone}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block"><Separator orientation="vertical" className="h-9" /></div>

                  <div className="text-sm">
                    <div className="font-medium">Dziecko</div>
                    <div className="text-neutral-700">
                      {childName}{typeof childAge === "number" ? ` (${childAge} lat)` : ""}
                    </div>
                  </div>

                  <div className="hidden md:block"><Separator orientation="vertical" className="h-9" /></div>

                  <div className="text-sm max-w-[420px]">
                    <div className="font-medium">{op === "unenroll" ? "Z zajęć" : "Zajęcia"}</div>
                    <div className="text-neutral-700">{cls || "—"}</div>
                  </div>

                  <div className="hidden md:block"><Separator orientation="vertical" className="h-9" /></div>

                  <div className="flex items-center gap-2">
                    <Badge variant={op === "unenroll" ? "destructive" : "secondary"}>
                      {op === "unenroll" ? "Wypisanie" : "Zapis"}
                    </Badge>
                    {created && <Badge variant="outline">{created}</Badge>}
                  </div>
                </div>

                {op === "unenroll" && (r.enrollmentId || effective) && (
                  <div className="mt-2 text-sm text-neutral-600">
                    {r.enrollmentId && <>ID zapisu: <span className="font-mono">{r.enrollmentId}</span></>}
                    {r.enrollmentId && effective && " • "}
                    {effective && <>Od kiedy: <span className="font-medium">{effective}</span></>}
                  </div>
                )}

                {(r.note || r.reason) && (
                  <div className="mt-2 text-sm text-neutral-600">
                    <span className="font-medium">Notatka:</span> {r.note || r.reason}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => approve(r)}>
                    {op === "unenroll" ? "Wypisz (zatwierdź)" : "Zatwierdź zapis"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => reject(r)}>Odrzuć</Button>
                  {lessonOrClassId && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openLessonDetails(lessonOrClassId)}
                    >
                      Szczegóły
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {details?.title || (detailsLoading ? "Wczytywanie..." : "Szczegóły zajęć")}
            </DialogTitle>
          </DialogHeader>

          {detailsLoading && (
            <div className="text-sm text-neutral-500">Ładowanie danych lekcji i uczestników…</div>
          )}

          {!detailsLoading && details && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-neutral-500">Harmonogram</div>
                  <div className="font-medium">{details.scheduleText || "—"}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Lokalizacja</div>
                  <div className="font-medium">{details.location || "—"}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Prowadzący</div>
                  <div className="font-medium">{details.instructor || "—"}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Pojemność</div>
                  <div className="font-medium">
                    {typeof details.capacity === "number"
                      ? `${details.participants.length}/${details.capacity}`
                      : `${details.participants.length}`}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500">Wiek</div>
                  <div className="font-medium">{details.ageRange || "—"}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Rozliczenia</div>
                  <div className="font-medium">
                    {details.billing?.model === "monthly"
                      ? `Miesięcznie: ${details.billing?.priceMonthly ?? "—"} PLN`
                      : details.billing?.model === "per_lesson"
                        ? `Za zajęcia: ${details.billing?.pricePerLesson ?? "—"} PLN`
                        : "—"}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="font-medium mb-2">Uczestnicy ({details.participants.length})</div>
                {details.participants.length === 0 ? (
                  <div className="text-sm text-neutral-500">Brak uczestników.</div>
                ) : (
                  <div className="max-h-64 overflow-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 sticky top-0">
                        <tr>
                          <th className="text-left p-2">Dziecko</th>
                          <th className="text-left p-2">Rodzic</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.participants.map((p) => (
                          <tr key={p.childId} className="border-t">
                            <td className="p-2">{p.childName}</td>
                            <td className="p-2 text-neutral-600">{p.parentName || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminEnrollmentRequests;
