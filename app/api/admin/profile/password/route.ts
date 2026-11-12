import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth-guards";
import { UpdatePasswordSchema } from "@/lib/validations/auth";
import { UnauthorizedError, ValidationError } from "@/lib/exceptions";

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await authenticateAdmin(req);

    const body = await req.json();
    const validatedData = UpdatePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError("User account not found");
    }

    const isMatch = await bcrypt.compare(validatedData.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new ValidationError("Current password is incorrect");
    }

    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    return ApiResponse.success({ message: "Password updated successfully" });
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}
