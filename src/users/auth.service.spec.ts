import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  beforeEach(async () => {
    // create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('dummy@email.com', '1234');
    expect(user.password).not.toEqual('1234');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    expect.assertions(1);
    await expect(
      service.signup('asdf@asdf.com', 'asdf'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws if signin is called with an usused email', async () => {
    await expect(
      service.signin('test@test.com', '1256352'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('dggwgwhg@whewu.com', 'password1');
    await expect(
      service.signin('dggwgwhg@whewu.com', 'password'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('test@test.com', 'password');
    const user = await service.signin('test@test.com', 'password');
    expect(user).toBeDefined();
  });
});
