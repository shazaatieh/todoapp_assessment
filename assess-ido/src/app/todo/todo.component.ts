import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { HttpClient, HttpClientModule } from '@angular/common/http';


interface TaskItem {
  id?: number;
  title: string;
  category: string;
  dueDate: string | null;
  estimate: string;
  importance: string | null;
  status: string;
  editingField?: string;
  editSnapshot?: Partial<TaskItem>;
}

interface TaskColumn {
  title: string;
  status: number;
  items: TaskItem[];
  originalItems: TaskItem[];
}

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, HttpClientModule],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {

  user: any = null;
  statusMap = ['To do', 'Doing', 'Done'];

  

  dropdownOpen = false;
  searchQuery = '';

  showBanner = true;



  todoColumns: TaskColumn[] = [
    { title: 'To Do', status: 0, items: [], originalItems: [] },
    { title: 'Doing', status: 1, items: [], originalItems: [] },
    { title: 'Done', status: 2, items: [], originalItems: [] }
  ];


  constructor(private router: Router, private http: HttpClient) {}
  
  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
  
    const headers = { Authorization: `Bearer ${token}` };
  
    this.http.get('https://localhost:7171/api/Auth/profile', { headers }).subscribe({
      next: (user: any) => {
        this.user = user;
        this.loadTasks(); 
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  

  toggleBanner() {
    this.showBanner = !this.showBanner;
  }


  loadTasks() {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
  
    this.http.get<TaskItem[]>(`https://localhost:7171/api/Tasks/${this.user.id}`, { headers }).subscribe({
      next: (tasks) => {
        for (const column of this.todoColumns) {
          column.items = tasks.filter(t => t.status === this.statusMap[column.status]);
          column.originalItems = [...column.items];
        }
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }
  
  

 
  



  startEditing(item: TaskItem, field: string) {
    item.editingField = field;
    const snapshot: TaskItem = { ...item };

    if (field === 'dueDate' && snapshot.dueDate) {
      const date = new Date(snapshot.dueDate);
      const localISO = date.toISOString().slice(0, 16); 
      snapshot.dueDate = localISO;
    }    
    item.editSnapshot = snapshot;
  }

  finishEditing(item: TaskItem, column: TaskColumn, field: string) {
    const edited = item.editSnapshot!;
  
    if (field === 'dueDate' && edited.dueDate) {
      const localDate = new Date(edited.dueDate); 
      edited.dueDate = localDate.toISOString();   
    }
    
  
    Object.assign(item, edited);
    item.editingField = undefined;
    item.editSnapshot = undefined;
  
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
  
    const payload = {
      ...item,
      userId: this.user.id,
      dueDate: item.dueDate,
      status: this.statusMap[column.status]
    };
  
    if (item.id) {
      this.http.put(`https://localhost:7171/api/Tasks/${item.id}`, payload, { headers }).subscribe();
    }
  
    const index = column.originalItems.findIndex(t => t.id === item.id);
    if (index !== -1) {
      column.originalItems[index] = { ...item };
    }
  }
  
  

  getColumnData(index: number): TaskItem[] {
    return this.todoColumns[index].items;
  }

  connectedDropListsIds(currentIndex: number): string[] {
    return this.todoColumns
      .map((_, idx) => `column-${idx}`)
      .filter((id, idx) => idx !== currentIndex);
  }
  

  drop(event: CdkDragDrop<TaskItem[]>) {
    const item = event.previousContainer.data[event.previousIndex];
  
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
  
      
      const targetColumnIndex = +event.container.id.split('-')[1];
      const newStatusString = this.statusMap[targetColumnIndex];
      
      item.status = newStatusString;
  
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
  
      this.http.put(`https://localhost:7171/api/Tasks/${item.id}`, {
        ...item,
        userId: this.user.id,
        status: newStatusString
      }, { headers }).subscribe({
        next: () => console.log('Status updated successfully.'),
        error: (err) => console.error('Status update failed:', err)
      });
    }
  }
  
  

  openTaskModal() {
    const newTask: TaskItem = {
      title: '',
      category: '',
      dueDate: null,
      estimate: '',
      importance: 'Medium',
      status: this.statusMap[0]
    };
  
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
  
    this.http.post<TaskItem>('https://localhost:7171/api/Tasks', {
      userId: this.user.id,
      title: newTask.title,
      category: newTask.category,
      dueDate: newTask.dueDate,
      estimate: newTask.estimate,
      importance: newTask.importance,
      status: newTask.status

    }, { headers }).subscribe(task => {
      task.editingField = 'title';
      task.editSnapshot = {
        title: task.title,
        category: task.category,
        dueDate: task.dueDate,
        estimate: task.estimate,
        importance: task.importance
      };
  
      this.todoColumns[0].items.unshift(task);
      this.todoColumns[0].originalItems.unshift({ ...task });
    });
  }
  
  
  
  
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  filterTasks() {
    const query = this.searchQuery.toLowerCase();

    this.todoColumns.forEach(column => {
      column.items = column.originalItems.filter((item: TaskItem) =>
        item.title.toLowerCase().includes(query) 
      );
    });
  }
  highlightSearch(text: string): string {
  if (!this.searchQuery) return text;
  const regex = new RegExp(`(${this.searchQuery})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}


  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
 