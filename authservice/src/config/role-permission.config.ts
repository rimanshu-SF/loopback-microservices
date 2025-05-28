import { Permission } from '../enums/permissions.enum';
import { UserRole } from '../enums/role.enum';

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.GET_AUTHOR, Permission.POST_AUTHOR, Permission.PATCH_AUTHOR, Permission.DELETE_AUTHOR, Permission.GET_AUTHOR_BY_ID,
    Permission.GET_BOOK, Permission.POST_BOOK, Permission.PATCH_BOOK, Permission.DELETE_BOOK, Permission.GET_BOOK_BY_ID,
    Permission.GET_CATEGORY, Permission.POST_CATEGORY, Permission.PATCH_CATEGORY, Permission.DELETE_CATEGORY, Permission.GET_CATEGORY_BY_ID,
  ],

  [UserRole.LIBRARIAN]: [
    Permission.GET_AUTHOR, Permission.POST_AUTHOR, Permission.PATCH_AUTHOR, Permission.GET_AUTHOR_BY_ID,
    Permission.GET_BOOK, Permission.POST_BOOK, Permission.PATCH_BOOK, Permission.GET_BOOK_BY_ID,
    Permission.GET_CATEGORY, Permission.POST_CATEGORY, Permission.PATCH_CATEGORY, Permission.GET_CATEGORY_BY_ID,
  ],

  [UserRole.USER]: [
    Permission.GET_AUTHOR, Permission.GET_AUTHOR_BY_ID,
    Permission.GET_BOOK, Permission.GET_BOOK_BY_ID,
    Permission.GET_CATEGORY, Permission.GET_CATEGORY_BY_ID,
    Permission.GET_LOGS
  ],
};
