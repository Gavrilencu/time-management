const API_URL = "http://localhost:8000/time-monitoring/api";

// Interfețe TypeScript
export interface User {
	id?: number;
	name: string;
	email: string;
	role: string;
	department: string;
	total_hours?: number;
}

export interface Project {
	id?: number;
	name: string;
	description: string;
	module_type: string; // "proiecte", "evom", "operational"
	status?: string;
	total_hours?: number;
}

export interface Task {
	id?: number;
	user_id: number;
	project_id: number;
	description: string;
	hours: number;
	date: string;
	created_at?: string;
	user_name?: string;
	project_name?: string;
	module_type?: string;
}

export interface TaskComment {
	id?: number;
	task_id: number;
	user_id: number;
	comment: string;
	created_at?: string;
	user_name?: string;
}

export interface TaskCommentCreate {
	task_id: number;
	user_id: number;
	comment: string;
}

export interface AuditLog {
	id?: number;
	user_id?: number;
	action: string;
	entity_type: string;
	entity_id?: number;
	old_values?: any;
	new_values?: any;
	ip_address?: string;
	user_agent?: string;
	created_at?: string;
	user_name?: string;
}

export interface TaskCreate {
	user_id: number;
	project_id: number;
	description: string;
	hours: number;
	date: string;
}

// Servicii API

// Utilizatori
export const userService = {
	async getAll(): Promise<User[]> {
		const response = await fetch(`${API_URL}/api/users`);
		if (!response.ok) throw new Error('Failed to fetch users');
		return response.json();
	},

	async getByEmail(email: string): Promise<User> {
		const response = await fetch(`${API_URL}/api/users/email/${encodeURIComponent(email)}`);
		if (!response.ok) {
			if (response.status === 404) {
				throw new Error('User not found');
			}
			throw new Error('Failed to fetch user');
		}
		return response.json();
	},

	async create(user: User): Promise<User> {
		const response = await fetch(`${API_URL}/api/users`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(user)
		});
		if (!response.ok) throw new Error('Failed to create user');
		return response.json();
	},

	async update(id: number, user: User): Promise<User> {
		const response = await fetch(`${API_URL}/api/users/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(user)
		});
		if (!response.ok) throw new Error('Failed to update user');
		return response.json();
	},

	async delete(id: number): Promise<void> {
		const response = await fetch(`${API_URL}/api/users/${id}`, {
			method: 'DELETE'
		});
		if (!response.ok) throw new Error('Failed to delete user');
	}
};

// Proiecte
export const projectService = {
	async getAll(): Promise<Project[]> {
		const response = await fetch(`${API_URL}/api/projects`);
		if (!response.ok) throw new Error('Failed to fetch projects');
		return response.json();
	},

	async getByModule(moduleType: string): Promise<Project[]> {
		const response = await fetch(`${API_URL}/api/projects/module/${moduleType}`);
		if (!response.ok) throw new Error('Failed to fetch projects by module');
		return response.json();
	},

	async create(project: Project): Promise<Project> {
		const response = await fetch(`${API_URL}/api/projects`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(project)
		});
		if (!response.ok) throw new Error('Failed to create project');
		return response.json();
	},

	async delete(id: number): Promise<void> {
		const response = await fetch(`${API_URL}/api/projects/${id}`, {
			method: 'DELETE'
		});
		if (!response.ok) throw new Error('Failed to delete project');
	}
};

// Task-uri
export const taskService = {
	async getAll(): Promise<Task[]> {
		const response = await fetch(`${API_URL}/api/tasks`);
		if (!response.ok) throw new Error('Failed to fetch tasks');
		return response.json();
	},

	async getByUser(userId: number): Promise<Task[]> {
		const response = await fetch(`${API_URL}/api/tasks/user/${userId}`);
		if (!response.ok) throw new Error('Failed to fetch user tasks');
		return response.json();
	},

	async getByDepartment(department: string): Promise<Task[]> {
		const response = await fetch(`${API_URL}/api/tasks/department/${encodeURIComponent(department)}`);
		if (!response.ok) throw new Error('Failed to fetch department tasks');
		return response.json();
	},

	async getByDate(date: string): Promise<Task[]> {
		const response = await fetch(`${API_URL}/api/tasks/date/${date}`);
		if (!response.ok) throw new Error('Failed to fetch tasks by date');
		return response.json();
	},

	async create(task: TaskCreate): Promise<Task> {
		const response = await fetch(`${API_URL}/api/tasks`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(task)
		});
		if (!response.ok) throw new Error('Failed to create task');
		return response.json();
	},

	async delete(id: number): Promise<void> {
		const response = await fetch(`${API_URL}/api/tasks/${id}`, {
			method: 'DELETE'
		});
		if (!response.ok) throw new Error('Failed to delete task');
	}
};

// Statistici
export const statsService = {
	async getOverview(): Promise<any> {
		const response = await fetch(`${API_URL}/api/stats/overview`);
		if (!response.ok) throw new Error('Failed to fetch overview stats');
		return response.json();
	},

	async getDaily(date: string): Promise<any> {
		const response = await fetch(`${API_URL}/api/stats/daily/${date}`);
		if (!response.ok) throw new Error('Failed to fetch daily stats');
		return response.json();
	}
};

export const exportService = {
	async exportJSON(): Promise<any> {
		const response = await fetch(`${API_URL}/api/export/json`);
		if (!response.ok) throw new Error('Failed to export JSON');
		return response.json();
	},

	async exportXML(): Promise<any> {
		const response = await fetch(`${API_URL}/api/export/xml`);
		if (!response.ok) throw new Error('Failed to export XML');
		return response.json();
	},

	async exportExcel(): Promise<Blob> {
		const response = await fetch(`${API_URL}/api/export/excel`);
		if (!response.ok) throw new Error('Failed to export Excel');
		return response.blob();
	}
};

// Comentarii Task-uri
export const commentService = {
	async getTaskComments(taskId: number): Promise<TaskComment[]> {
		const response = await fetch(`${API_URL}/api/tasks/${taskId}/comments`);
		if (!response.ok) throw new Error('Failed to fetch task comments');
		return response.json();
	},

	async createComment(comment: TaskCommentCreate): Promise<TaskComment> {
		const response = await fetch(`${API_URL}/api/tasks/${comment.task_id}/comments`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(comment)
		});
		if (!response.ok) throw new Error('Failed to create comment');
		return response.json();
	},

	async deleteComment(commentId: number): Promise<void> {
		const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
			method: 'DELETE'
		});
		if (!response.ok) throw new Error('Failed to delete comment');
	}
};

// Audit Logs
export const auditService = {
	async getAuditLogs(skip: number = 0, limit: number = 100, userId?: number): Promise<AuditLog[]> {
		const params = new URLSearchParams({
			skip: skip.toString(),
			limit: limit.toString()
		});
		if (userId) params.append('user_id', userId.toString());
		
		const response = await fetch(`${API_URL}/api/audit-logs?${params}`);
		if (!response.ok) throw new Error('Failed to fetch audit logs');
		return response.json();
	},

	async getAuditStats(): Promise<any> {
		const response = await fetch(`${API_URL}/api/audit-logs/stats`);
		if (!response.ok) throw new Error('Failed to fetch audit stats');
		return response.json();
	}
};
