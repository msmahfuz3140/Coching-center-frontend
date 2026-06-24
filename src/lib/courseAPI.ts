// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const courseAPI = {
    // Public endpoints
    getAllCourses: async (category: string | null = null) => {
        const url = new URL(`${API_BASE_URL}/courses`);
        if (category) url.searchParams.append('category', category);

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch courses');
        return res.json();
    },

    getCourseBySlug: async (slug: string) => {
        const res = await fetch(`${API_BASE_URL}/courses/${slug}`);
        if (!res.ok) throw new Error('Course not found');
        return res.json();
    },

    // Student endpoints
    requestCourseAccess: async (courseSlug: string, token: string, message: string = '') => {
        const res = await fetch(`${API_BASE_URL}/courses/${courseSlug}/request-access`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ requestMessage: message }),
        });
        if (!res.ok) throw new Error('Failed to request access');
        return res.json();
    },

    // Admin endpoints
    createCourse: async (courseData: any, token: string) => {
        const res = await fetch(`${API_BASE_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(courseData),
        });
        if (!res.ok) throw new Error('Failed to create course');
        return res.json();
    },

    updateCourse: async (courseId: string, courseData: any, token: string) => {
        const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(courseData),
        });
        if (!res.ok) throw new Error('Failed to update course');
        return res.json();
    },

    deleteCourse: async (courseId: string, token: string) => {
        const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) throw new Error('Failed to delete course');
        return res.json();
    },

    getPendingRequests: async (token: string) => {
        const res = await fetch(`${API_BASE_URL}/courses/admin/requests`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) throw new Error('Failed to fetch requests');
        return res.json();
    },

    // Access management
    getAccessRecords: async (token: string) => {
        const res = await fetch(`${API_BASE_URL}/courses/admin/accesses`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch access records');
        return res.json();
    },

    updateAccess: async (accessId: string, data: any, token: string) => {
        const res = await fetch(`${API_BASE_URL}/courses/admin/access/${accessId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update access');
        return res.json();
    },

    blockAccess: async (accessId: string, blocked: boolean, token: string) => {
        const res = await fetch(`${API_BASE_URL}/courses/admin/access/${accessId}/block`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ blocked }),
        });
        if (!res.ok) throw new Error('Failed to block/unblock access');
        return res.json();
    },

    deleteAccess: async (accessId: string, token: string) => {
        const res = await fetch(`${API_BASE_URL}/courses/admin/access/${accessId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete access');
        return res.json();
    },

    approveCourseAccess: async (requestId: string, token: string, message: string = '', accessPages: number = 0, expiresAt?: string) => {
        const body: any = { responseMessage: message, accessPages };
        if (expiresAt) body.expiresAt = expiresAt;
        const res = await fetch(`${API_BASE_URL}/courses/admin/requests/${requestId}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed to approve access');
        return res.json();
    },

    rejectCourseAccess: async (requestId: string, token: string, message: string = '') => {
        const res = await fetch(`${API_BASE_URL}/courses/admin/requests/${requestId}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ responseMessage: message }),
        });
        if (!res.ok) throw new Error('Failed to reject access');
        return res.json();
    },
};
