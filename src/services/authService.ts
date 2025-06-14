interface User {
  id: string;
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

class AuthService {
  private users: User[] = [];
  private currentUser: User | null = null;
  private readonly USERS_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';

  constructor() {
    this.loadUsers();
    this.loadCurrentUser();
  }

  private loadUsers(): void {
    const usersStr = localStorage.getItem(this.USERS_KEY);
    if (usersStr) {
      this.users = JSON.parse(usersStr);
    } else {
      // Initialize with default admin user
      const adminUser: User = {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // In a real app, this would be hashed
      };
      this.users = [adminUser];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(this.users));
    }
  }

  private loadCurrentUser(): void {
    const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  private saveUsers(): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(this.users));
  }

  private saveCurrentUser(): void {
    if (this.currentUser) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    // Check if user already exists
    if (this.users.some(user => user.email === email)) {
      return {
        success: false,
        message: 'User already exists',
      };
    }

    // Validate password
    if (!password || password.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters long',
      };
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      password, // In a real app, this would be hashed
    };

    this.users.push(newUser);
    this.saveUsers();
    return {
      success: true,
      message: 'Registration successful',
      user: newUser,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Validate password
    if (!password || password.length < 6) {
      return {
        success: false,
        message: 'Invalid password',
      };
    }

    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      return {
        success: false,
        message: 'Invalid credentials',
      };
    }

    this.currentUser = user;
    this.saveCurrentUser();
    return {
      success: true,
      message: 'Login successful',
      user,
    };
  }

  logout(): void {
    this.currentUser = null;
    this.saveCurrentUser();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getAllUsers(): User[] {
    return this.users;
  }
}

export const authService = new AuthService(); 