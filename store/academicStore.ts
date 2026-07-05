import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Batch, School, Department, SchoolClass } from '@/types/admin';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AcademicState {
  batches: Batch[];
  schools: School[];
  departments: Department[];
  classes: SchoolClass[];
  selectedBatchId: string | null;
  isLoading: boolean;

  setSelectedBatchId: (id: string | null) => void;

  fetchBatches: () => Promise<void>;
  addBatch: (name: string) => Promise<void>;
  updateBatch: (id: string, name: string) => Promise<void>;
  deleteBatch: (id: string) => Promise<void>;

  fetchSchools: (batchId: string) => Promise<void>;
  addSchool: (name: string, batchId: string) => Promise<void>;
  updateSchool: (id: string, name: string) => Promise<void>;
  deleteSchool: (id: string) => Promise<void>;

  fetchDepartments: (schoolId: string) => Promise<void>;
  addDepartment: (name: string, schoolId: string) => Promise<void>;
  updateDepartment: (id: string, name: string) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;

  fetchClasses: (departmentId: string) => Promise<void>;
  addClass: (name: string, departmentId: string) => Promise<void>;
  updateClass: (id: string, name: string) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
}

export const useAcademicStore = create<AcademicState>()(
  persist(
    (set, get) => ({
      batches: [],
      schools: [],
      departments: [],
      classes: [],
      selectedBatchId: null,
      isLoading: false,

      setSelectedBatchId: (id) => set({ selectedBatchId: id, schools: [], departments: [], classes: [] }),

      fetchBatches: async () => {
        set({ isLoading: true });
        const { data } = await api.get('/batches');
        set({ batches: data, isLoading: false });
      },
      addBatch: async (name) => {
        set({ isLoading: true });
        const { data } = await api.post('/batches', { name });
        set((state) => ({ batches: [data, ...state.batches], isLoading: false }));
        toast.success('Batch Created Successfully');
      },
      updateBatch: async (id, name) => {
        set({ isLoading: true });
        const { data } = await api.patch(`/batches/${id}`, { name });
        set((state) => ({ batches: state.batches.map((b) => (b.id === id ? data : b)), isLoading: false }));
        toast.success('Batch Updated Successfully');
      },
      deleteBatch: async (id) => {
        set({ isLoading: true });
        await api.delete(`/batches/${id}`);
        set((state) => ({
          batches: state.batches.filter((b) => b.id !== id),
          selectedBatchId: state.selectedBatchId === id ? null : state.selectedBatchId,
          isLoading: false,
        }));
        toast.success('Batch Deleted Successfully');
      },

      fetchSchools: async (batchId) => {
        set({ isLoading: true });
        const { data } = await api.get('/schools', { params: { batchId } });
        set({ schools: data, isLoading: false });
      },
      addSchool: async (name, batchId) => {
        set({ isLoading: true });
        const { data } = await api.post('/schools', { name, batchId });
        set((state) => ({ schools: [data, ...state.schools], isLoading: false }));
        toast.success('School Created Successfully');
      },
      updateSchool: async (id, name) => {
        set({ isLoading: true });
        const { data } = await api.patch(`/schools/${id}`, { name });
        set((state) => ({ schools: state.schools.map((s) => (s.id === id ? data : s)), isLoading: false }));
        toast.success('School Updated Successfully');
      },
      deleteSchool: async (id) => {
        set({ isLoading: true });
        await api.delete(`/schools/${id}`);
        set((state) => ({ schools: state.schools.filter((s) => s.id !== id), isLoading: false }));
        toast.success('School Deleted Successfully');
      },

      fetchDepartments: async (schoolId) => {
        set({ isLoading: true });
        const { data } = await api.get('/departments', { params: { schoolId } });
        set({ departments: data, isLoading: false });
      },
      addDepartment: async (name, schoolId) => {
        set({ isLoading: true });
        const { data } = await api.post('/departments', { name, schoolId });
        set((state) => ({ departments: [data, ...state.departments], isLoading: false }));
        toast.success('Department Created Successfully');
      },
      updateDepartment: async (id, name) => {
        set({ isLoading: true });
        const { data } = await api.patch(`/departments/${id}`, { name });
        set((state) => ({ departments: state.departments.map((d) => (d.id === id ? data : d)), isLoading: false }));
        toast.success('Department Updated Successfully');
      },
      deleteDepartment: async (id) => {
        set({ isLoading: true });
        await api.delete(`/departments/${id}`);
        set((state) => ({ departments: state.departments.filter((d) => d.id !== id), isLoading: false }));
        toast.success('Department Deleted Successfully');
      },

      fetchClasses: async (departmentId) => {
        set({ isLoading: true });
        const { data } = await api.get('/classes', { params: { departmentId } });
        set({ classes: data, isLoading: false });
      },
      addClass: async (name, departmentId) => {
        set({ isLoading: true });
        const { data } = await api.post('/classes', { name, departmentId });
        set((state) => ({ classes: [data, ...state.classes], isLoading: false }));
        toast.success('Class Created Successfully');
      },
      updateClass: async (id, name) => {
        set({ isLoading: true });
        const { data } = await api.patch(`/classes/${id}`, { name });
        set((state) => ({ classes: state.classes.map((c) => (c.id === id ? data : c)), isLoading: false }));
        toast.success('Class Updated Successfully');
      },
      deleteClass: async (id) => {
        set({ isLoading: true });
        await api.delete(`/classes/${id}`);
        set((state) => ({ classes: state.classes.filter((c) => c.id !== id), isLoading: false }));
        toast.success('Class Deleted Successfully');
      },
    }),
    {
      name: 'academic-storage',
      partialize: (state) => ({ selectedBatchId: state.selectedBatchId }),
    }
  )
);
