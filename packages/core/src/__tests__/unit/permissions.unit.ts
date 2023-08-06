import {extractPermissions} from '../../permissions';

describe('permissions', function () {
  enum PermissionKeys1 {
    CreateTest = 'CreateTest',
    ViewTest = 'ViewTest',
    UpdateTest = 'UpdateTest',
    DeleteTest = 'DeleteTest',
    ViewOwnTest = 'ViewOwnTest',
    UpdateOwnTest = 'UpdateOwnTest',
  }

  enum PermissionKeys2 {
    ViewDocs = 'ViewDocs',
    UpdateDocs = 'UpdateDocs',
    DeleteDocs = 'DeleteDocs',
    ViewOwnDocs = 'ViewOwnDocs',
  }

  it('should extract string permissions', function () {
    const permissions = extractPermissions(PermissionKeys1);

    expect(permissions).toEqual([
      PermissionKeys1.CreateTest,
      PermissionKeys1.ViewTest,
      PermissionKeys1.UpdateTest,
      PermissionKeys1.DeleteTest,
      PermissionKeys1.ViewOwnTest,
      PermissionKeys1.UpdateOwnTest,
    ]);
  });

  it('should extract permissions exclude some specific permissions', function () {
    const permissions = extractPermissions(PermissionKeys1, ['*', '!*Own*']);
    expect(permissions).toEqual([
      PermissionKeys1.CreateTest,
      PermissionKeys1.ViewTest,
      PermissionKeys1.UpdateTest,
      PermissionKeys1.DeleteTest,
    ]);
  });

  it('should extract permissions include some specific permissions', function () {
    const permissions = extractPermissions(PermissionKeys1, ['*Own*']);
    expect(permissions).toEqual([PermissionKeys1.ViewOwnTest, PermissionKeys1.UpdateOwnTest]);
  });

  it('should extract permissions array', function () {
    const permissions = extractPermissions([PermissionKeys1, PermissionKeys2], ['*Own*']);
    expect(permissions).toEqual([
      PermissionKeys1.ViewOwnTest,
      PermissionKeys1.UpdateOwnTest,
      PermissionKeys2.ViewOwnDocs,
    ]);
  });
});
