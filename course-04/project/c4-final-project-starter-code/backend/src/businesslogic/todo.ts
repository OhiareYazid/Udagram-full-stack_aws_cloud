// Import necessary dependencies and modules
import { TodoItem } from "../models/TodoItem";
import { parseUserId } from "../auth/utils";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { TodoUpdate } from "../models/TodoUpdate";
import { TodoAccess } from "../dataLayer/TodoAccess";

import * as uuid from 'uuid'
// Instantiate a new instance of the TodoAccess class
const todoAccess = new TodoAccess();

// Get all todos for a user
export async function getTodos(jwtToken: string): Promise<TodoItem[]> {
    // Parse the user ID from the JWT token
    const userId = parseUserId(jwtToken);
    // Call the getTodos method of the TodoAccess instance
    return todoAccess.getTodoItems(userId);
}

// Create a new todo item
export function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {
    // Parse the user ID from the JWT token
    const userId = parseUserId(jwtToken);
    // Generate a new UUID for the todo item
    const todoId = uuid.v4();
    // Get the S3 bucket name from the environment variables
    const s3BucketName = process.env.S3_BUCKET_NAME;
    // Create a new todo item with the provided request data and other properties
    const item = {
        userId: userId,
        todoId: todoId,
        attachmentUrl: `https://${s3BucketName}.s3.amazonaws.com/${todoId}`,
        createdAt: new Date().toISOString(),
        done: false,
        ...createTodoRequest,
    };
    // Call the createTodo method of the TodoAccess instance
    return todoAccess.createTodoItem(item);
}

// Update an existing todo item
export function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    todoId: string,
    jwtToken: string
): Promise<TodoUpdate> {
    // Parse the user ID from the JWT token
    const userId = parseUserId(jwtToken);
    // Call the updateTodo method of the TodoAccess instance
    return todoAccess.updateTodoItem(updateTodoRequest, todoId, userId);
}

// Delete an existing todo item
export function deleteTodo(
    todoId: string,
    jwtToken: string
): Promise<string> {
    // Parse the user ID from the JWT token
    const userId = parseUserId(jwtToken);
    // Call the deleteTodo method of the TodoAccess instance
    return todoAccess.deleteTodoItem(todoId, userId);
}

// Generate an S3 presigned URL for uploading an attachment to a todo item
export function generateUploadUrl(todoId: string): Promise<string> {
    // Call the generateUploadUrl method of the TodoAccess instance
    return todoAccess.generateUploadUrl(todoId);
}
