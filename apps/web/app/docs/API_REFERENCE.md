# 🌐 API Reference

## ⚠️ **React Router v7 Integration**

This API reference is designed to work with **React Router v7 loaders and actions**. Avoid using `useEffect` for data fetching - use loaders instead.

## 📋 **Overview**

This document provides a **concise reference** for the backend API structure, authentication, and common patterns. For detailed endpoint documentation, see individual module documentation.

## 🚀 **Quick Start**

### **Environment Setup**

```typescript
// .env file
VITE_BACKEND_BASE_URL=http://localhost:3001
VITE_API_VERSION=v1

// Base URL pattern
const BASE_URL = `${import.meta.env.VITE_BACKEND_BASE_URL}/api/${import.meta.env.VITE_API_VERSION}`;
```

### **Authentication**

```typescript
// All endpoints require x-api-key header
const headers = {
  "x-api-key": apiKey,
  "Content-Type": "application/json",
};
```

---

## 📊 **Response Format**

### **Standard Response Structure**

```typescript
// Success Response
interface ApiResponse<T> {
  ok: true;
  data: T;
}

// Error Response
interface ApiError {
  ok: false;
  error: string;
  statusCode?: number;
}

// Usage Pattern
const result = await apiCall(params, apiKey);
if (result.ok && result.data) {
  // Handle success
} else {
  // Handle error
}
```

---

## 🏗️ **API Structure**

### **Base Endpoints**

```
/api/v1/
├── organization/     # Organization management
├── user/            # User management
├── group/           # Groups and teams
├── leave-type/      # Leave type definitions
├── leave/           # Leave requests and management
├── dashboard/       # Analytics and stats
└── health/          # System health check
```

### **Common HTTP Methods**

- `GET` - Retrieve data (list, details, search)
- `POST` - Create new resources
- `PUT` - Update existing resources
- `DELETE` - Deactivate/remove resources

---

## 🔍 **Common Patterns**

### **React Router v7 Integration**

```typescript
// ✅ RECOMMENDED: Use loaders for data fetching
export async function loader({ request }: LoaderFunctionArgs) {
  const apiKey = getApiKeyFromRequest(request);
  const result = await listResources(apiKey);

  if (!result.ok) throw new Error(result.error);
  return { resources: result.data, apiKey };
}

// ❌ AVOID: useEffect for initial data
// useEffect(() => { fetchData(); }, []); // Don't do this
```

### **List Resources**

### **Get Single Resource**

```typescript
// GET /api/v1/{resource}/{id}
// Returns: { ok: true, data: Resource }
const resource = await getResource(id, apiKey);
```

### **Create Resource**

```typescript
// POST /api/v1/{resource}/
// Body: CreateResourceRequest
// Returns: { ok: true, data: { id: string } }
const result = await createResource(data, apiKey);
```

### **Update Resource**

```typescript
// PUT /api/v1/{resource}/{id}
// Body: UpdateResourceRequest
// Returns: { ok: true, data: { updated: boolean } }
const result = await updateResource(id, data, apiKey);
```

### **Delete/Deactivate Resource**

```typescript
// DELETE /api/v1/{resource}/{id}
// Returns: { ok: true, data: { deactivated: boolean } }
const result = await deleteResource(id, apiKey);
```

---

## 📝 **Data Types**

### **Common Fields**

```typescript
interface BaseResource {
  id: string;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User extends BaseResource {
  name: string;
  email: string;
  image: string | null;
  role: "OWNER" | "ADMIN" | "EMPLOYEE";
}

interface Group extends BaseResource {
  name: string;
  description: string | null;
  icon: string | null;
}
```

---

## ⚠️ **Error Handling**

### **HTTP Status Codes**

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

### **Common Error Messages**

```typescript
const commonErrors = {
  INVALID_API_KEY: "Invalid or expired API key",
  INSUFFICIENT_PERMISSIONS: "You don't have permission to perform this action",
  RESOURCE_NOT_FOUND: "The requested resource was not found",
  VALIDATION_ERROR: "The provided data is invalid",
  DUPLICATE_RESOURCE: "A resource with this information already exists",
};
```

---

## 🔧 **Best Practices**

### **API Usage**

1. **Always check response.ok** before accessing data
2. **Handle errors gracefully** with user-friendly messages
3. **Use proper loading states** during API calls
4. **Implement retry logic** for transient failures
5. **Cache responses** when appropriate

### **Rate Limiting**

- **Standard endpoints**: 100 requests/minute
- **Search endpoints**: 50 requests/minute
- **Bulk operations**: 10 requests/minute

---

## 📚 **Detailed Documentation**

For comprehensive endpoint documentation with examples:

- **Groups API**: See `../components/groupsManagement/README.md`
- **Users API**: See `../components/userManagement/README.md`
- **Leave Types API**: See `../components/leaveTypes/README.md`
- **Leave Management API**: See `../components/myLeaves/README.md`

---

## 🔗 **Related Resources**

- [Integration Patterns Guide](./INTEGRATION_PATTERNS.md) - How to use these APIs
- [Component Library](../shared/README.md) - Reusable UI components
- [Backend Documentation](../../../backend/README.md) - Backend implementation details

---

_This reference provides the essential structure. For detailed examples and specific endpoints, refer to individual module documentation._
