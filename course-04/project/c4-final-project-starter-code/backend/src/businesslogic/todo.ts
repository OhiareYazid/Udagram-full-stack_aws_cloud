import { TodoItem } from "../models/TodoItem";
import { parseUserId } from "../auth/utils";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { TodoUpdate } from "../models/TodoUpdate";
import { TodoAccess } from "../dataLayer/TodoAcess";

import * as uuid from 'uuid'

const todoAccess = new TodoAccess();

export async function getTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken);
    return todoAccess.getTodoItems(userId);
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {
    const userId = parseUserId(jwtToken);
    const todoId = uuid.v4();
    const s3BucketName = process.env.S3_BUCKET_NAME;
    const item = {
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        done: false,
        ...createTodoRequest,
    };
    return todoAccess.createTodoItem(item);
}

export async function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    todoId: string,
    jwtToken: string,
    attachmentUrl: string | undefined
): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken);
    let item = await todoAccess.getTodoItem(todoId, userId);

    if (item.attachmentUrl !== attachmentUrl) {
        throw new Error('Invalid attachment URL');
    }

    item = {
        ...item,
        ...updateTodoRequest,
        attachmentUrl: attachmentUrl ? attachmentUrl : item.attachmentUrl
    };

    return todoAccess.updateTodoItem(item);
}

export async function deleteTodo(
    todoId: string,
    jwtToken: string
): Promise<string> {
    const userId = parseUserId(jwtToken);
    return todoAccess.deleteTodoItem(todoId, userId);
}

export function generateUploadUrl(todoId: string): Promise<string> {
    return todoAccess.generateUploadUrl(todoId);
}
