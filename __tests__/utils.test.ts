import * as cache from '@actions/cache';
import {
  validateVersion,
  validatePythonVersionFormatForPyPy,
  isCacheFeatureAvailable
} from '../src/utils';

jest.mock('@actions/cache');

describe('validatePythonVersionFormatForPyPy', () => {
  it.each([
    ['3.6', true],
    ['3.7', true],
    ['3.6.x', false],
    ['3.7.x', false],
    ['3.x', false],
    ['3', false]
  ])('%s -> %s', (input, expected) => {
    expect(validatePythonVersionFormatForPyPy(input)).toEqual(expected);
  });
});

describe('validateVersion', () => {
  it.each([
    ['v7.3.3', true],
    ['v7.3.x', true],
    ['v7.x', true],
    ['x', true],
    ['v7.3.3-rc.1', true],
    ['nightly', true],
    ['v7.3.b', false],
    ['3.6', true],
    ['3.b', false],
    ['3', true]
  ])('%s -> %s', (input, expected) => {
    expect(validateVersion(input)).toEqual(expected);
  });
});

describe('isCacheFeatureAvailable', () => {
  it('isCacheFeatureAvailable disabled on GHES', () => {
    jest.spyOn(cache, 'isFeatureAvailable').mockImplementation(() => false);
    try {
      process.env['GITHUB_SERVER_URL'] = 'http://example.com';
      isCacheFeatureAvailable();
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        'Caching is only supported on GHES version >= 3.5. If you are on version >=3.5 Please check with GHES admin if Actions cache service is enabled or not.'
      );
    } finally {
      delete process.env['GITHUB_SERVER_URL'];
    }
  });

  it('isCacheFeatureAvailable disabled on dotcom', () => {
    jest.spyOn(cache, 'isFeatureAvailable').mockImplementation(() => false);
    try {
      process.env['GITHUB_SERVER_URL'] = 'http://github.com';
      isCacheFeatureAvailable();
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        'An internal error has occurred in cache backend. Please check https://www.githubstatus.com/ for any ongoing issue in actions.'
      );
    } finally {
      delete process.env['GITHUB_SERVER_URL'];
    }
  });

  it('isCacheFeatureAvailable is enabled', () => {
    jest.spyOn(cache, 'isFeatureAvailable').mockImplementation(() => true);
    expect(isCacheFeatureAvailable()).toBe(true);
  });
});
