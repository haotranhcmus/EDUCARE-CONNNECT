import type { Database } from "@/lib/supabase/database.types";
import {
  studentService,
  type StudentFilters,
  type StudentWithStats,
} from "@/src/services/student.service";
import { useAuthStore } from "@/src/stores/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Student = Database["public"]["Tables"]["students"]["Row"];
type StudentInsert = Database["public"]["Tables"]["students"]["Insert"];
type StudentUpdate = Database["public"]["Tables"]["students"]["Update"];

// Query keys - now includes userId for user-specific caching
export const studentKeys = {
  all: (userId?: string) => ["students", userId] as const,
  lists: (userId?: string) => [...studentKeys.all(userId), "list"] as const,
  list: (userId?: string, filters?: StudentFilters) =>
    [...studentKeys.lists(userId), filters] as const,
  details: (userId?: string) => [...studentKeys.all(userId), "detail"] as const,
  detail: (userId: string, id: string) =>
    [...studentKeys.details(userId), id] as const,
  sessions: (userId: string, id: string) =>
    [...studentKeys.detail(userId, id), "sessions"] as const,
};

/**
 * Hook to get list of students with filters
 */
export function useStudents(filters?: StudentFilters) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: studentKeys.list(user?.id, filters),
    queryFn: () => studentService.getStudents(filters),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get student detail with statistics
 */
export function useStudent(id: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: studentKeys.detail(user?.id || "", id),
    queryFn: () => studentService.getStudent(id),
    enabled: !!id && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get student sessions
 */
export function useStudentSessions(studentId: string, limit = 10) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: studentKeys.sessions(user?.id || "", studentId),
    queryFn: () => studentService.getStudentSessions(studentId, limit),
    enabled: !!studentId && !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to create a new student
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: StudentInsert) => studentService.createStudent(data),
    onSuccess: (newStudent) => {
      // Invalidate student lists to refetch
      queryClient.invalidateQueries({ queryKey: studentKeys.lists(user?.id) });

      // Optimistically add to cache
      queryClient.setQueryData<Student[]>(
        studentKeys.lists(user?.id),
        (old) => {
          if (!old) return [newStudent];
          return [newStudent, ...old];
        }
      );
    },
  });
}

/**
 * Hook to update student
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StudentUpdate }) =>
      studentService.updateStudent(id, data),
    onSuccess: (updatedStudent) => {
      // Invalidate and update student detail
      queryClient.setQueryData<StudentWithStats>(
        studentKeys.detail(user?.id || "", updatedStudent.id),
        (old) => {
          if (!old) return updatedStudent;
          return { ...old, ...updatedStudent };
        }
      );

      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: studentKeys.lists(user?.id) });
    },
  });
}

/**
 * Hook to delete student (soft delete)
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (id: string) => studentService.deleteStudent(id),
    onSuccess: (_, deletedId) => {
      // Remove from detail cache
      queryClient.removeQueries({
        queryKey: studentKeys.detail(user?.id || "", deletedId),
      });

      // Remove from lists
      queryClient.setQueryData<Student[]>(
        studentKeys.lists(user?.id),
        (old) => {
          if (!old) return [];
          return old.filter((student) => student.id !== deletedId);
        }
      );

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: studentKeys.lists(user?.id) });
    },
  });
}

/**
 * Hook to upload student avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({
      studentId,
      file,
    }: {
      studentId: string;
      file: { uri: string; type: string; name: string };
    }) => studentService.uploadAvatar(studentId, file),
    onSuccess: (avatarUrl, { studentId }) => {
      // Update student detail cache
      queryClient.setQueryData<StudentWithStats>(
        studentKeys.detail(user?.id || "", studentId),
        (old) => {
          if (!old) return old;
          return { ...old, avatar_url: avatarUrl };
        }
      );

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: studentKeys.lists(user?.id) });
    },
  });
}

/**
 * Hook to delete avatar
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({
      studentId,
      avatarUrl,
    }: {
      studentId: string;
      avatarUrl: string;
    }) => studentService.deleteAvatar(avatarUrl),
    onSuccess: (_, { studentId }) => {
      // Update student to remove avatar
      queryClient.setQueryData<StudentWithStats>(
        studentKeys.detail(user?.id || "", studentId),
        (old) => {
          if (!old) return old;
          return { ...old, avatar_url: null };
        }
      );

      // Also update via mutation
      const updateMutation = useUpdateStudent();
      updateMutation.mutate({
        id: studentId,
        data: { avatar_url: null },
      });
    },
  });
}
