// transactional.decorator.ts
import { PrismaService } from '../prisma/prisma.service';

export function Transactional(): MethodDecorator {
  return (_target, _propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const prisma: PrismaService =
        (this as any).prisma ||
        (this as any).prismaService;

      if (!prisma) {
        throw new Error('PrismaService not found on target');
      }

      return prisma.runInTransaction(() => original.apply(this, args));
    };

    return descriptor;
  };
}
