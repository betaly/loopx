import {matchResources} from '../../utils';

describe('utils', function () {
  describe('matchResources', function () {
    it('should match string resources', function () {
      const resources = ['a', 'b', 'c'];
      const patterns = ['a', 'b'];
      const result = matchResources(resources, patterns);
      expect(result).toEqual(['a', 'b']);
    });

    it('should match object resources', function () {
      const resources = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
      const patterns = ['a', 'b'];
      const result = matchResources(resources, patterns);
      expect(result).toEqual([{name: 'a'}, {name: 'b'}]);
    });

    it('should match multiple minimatch patterns', function () {
      const resources = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
      const patterns = ['*', '!c'];
      const result = matchResources(resources, patterns);
      expect(result).toEqual([{name: 'a'}, {name: 'b'}]);
    });
  });
});
