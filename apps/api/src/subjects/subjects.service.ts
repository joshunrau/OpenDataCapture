import { InjectModel, type Model } from '@douglasneuroinformatics/libnest/core';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/generated-client';

import { accessibleQuery } from '@/ability/ability.utils';
import type { EntityOperationOptions } from '@/core/types';

import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(@InjectModel('SubjectModel') private readonly subjectModel: Model<'SubjectModel'>) {}

  async count(where: Prisma.SubjectModelWhereInput = {}, { ability }: EntityOperationOptions = {}) {
    return this.subjectModel.count({
      where: { AND: [accessibleQuery(ability, 'read', 'SubjectModel'), where] }
    });
  }

  async create({ id, ...data }: CreateSubjectDto) {
    if (await this.subjectModel.exists({ id })) {
      throw new ConflictException('A subject with the provided demographic information already exists');
    }
    return this.subjectModel.create({
      data: {
        groupIds: [],
        id,
        ...data
      }
    });
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    const subject = await this.findById(id);
    return this.subjectModel.delete({
      where: { AND: [accessibleQuery(ability, 'delete', 'SubjectModel')], id: subject.id }
    });
  }

  async find({ groupId }: { groupId?: string } = {}, { ability }: EntityOperationOptions = {}) {
    const groupInput = groupId ? { groupIds: { has: groupId } } : {};
    return await this.subjectModel.findMany({
      where: {
        AND: [accessibleQuery(ability, 'read', 'SubjectModel'), groupInput]
      }
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const subject = await this.subjectModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'SubjectModel'), { id }] }
    });
    if (!subject) {
      throw new NotFoundException(`Failed to find subject with id: ${id}`);
    }
    return subject;
  }

  async updateById(id: string, data: Prisma.SubjectModelUpdateArgs['data'], { ability }: EntityOperationOptions = {}) {
    return this.subjectModel.update({
      data,
      where: { id, ...accessibleQuery(ability, 'update', 'SubjectModel') }
    });
  }
}
