import {UserViewRepository} from '../../repositories';
import {Filter, FilterBuilder, RepositoryBindings, Where} from '@loopback/repository';
import {UserView} from '../../models/user.view';
import {UserCoreApplication} from '../fixtures/application';
import {setupApplication} from '../helpers';
import {Roles} from '../../enums';
import {User} from '../../models';
import {DEFAULT_SUPERADMIN_CREDENTIALS} from '../../defaults';

describe('UerViewRepository', () => {
  let app: UserCoreApplication;
  let userViewRepo: UserViewRepository;

  beforeEach(async () => {
    app = await setupApplication();
    userViewRepo = await app.get(`${RepositoryBindings.REPOSITORIES}.${UserViewRepository.name}`);
  });

  afterEach(async () => {
    await app.stop();
  });

  it('find with relations', async () => {
    const filterBuilder = new FilterBuilder();
    filterBuilder.where({
      'userTenants.role.code': Roles.SuperAdmin,
    });
    filterBuilder.include(...UserView.InclusionsForUser);
    const users = await userViewRepo.find(filterBuilder.build() as Filter<User>);
    expect(users).toHaveLength(1);
  });

  it('findOne with relations', async () => {
    const filterBuilder = new FilterBuilder();
    filterBuilder.where({
      'userTenants.role.code': Roles.SuperAdmin,
    });
    filterBuilder.include(...UserView.InclusionsForUser);
    const user = await userViewRepo.findOne(filterBuilder.build() as Filter<User>);
    expect(user).toMatchObject({
      username: DEFAULT_SUPERADMIN_CREDENTIALS.identifier,
    });
  });

  it('count with relations', async () => {
    const count = await userViewRepo.count({
      'userTenants.role.code': Roles.SuperAdmin,
    } as Where);
    expect(count).toMatchObject({
      count: 1,
    });
  });
});
