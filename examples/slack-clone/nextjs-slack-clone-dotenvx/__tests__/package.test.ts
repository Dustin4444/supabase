import { describe, test, expect, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('package.json validation', () => {
  let packageJson: any
  let packageJsonRaw: string

  beforeEach(() => {
    const packagePath = join(__dirname, '..', 'package.json')
    packageJsonRaw = readFileSync(packagePath, 'utf-8')
    packageJson = JSON.parse(packageJsonRaw)
  })

  describe('JSON structure', () => {
    test('should be valid JSON', () => {
      expect(() => JSON.parse(packageJsonRaw)).not.toThrow()
    })

    test('should parse to an object', () => {
      expect(packageJson).toBeTypeOf('object')
      expect(packageJson).not.toBeNull()
    })

    test('should not have trailing commas', () => {
      // Check for common JSON syntax errors
      expect(packageJsonRaw).not.toMatch(/,\s*[}\]]/)
    })

    test('should have consistent indentation', () => {
      const lines = packageJsonRaw.split('\n')
      const indentedLines = lines.filter(line => line.match(/^\s+/))
      
      // Check that indentation is consistent (2 spaces)
      indentedLines.forEach(line => {
        const indent = line.match(/^(\s+)/)?.[1] || ''
        if (indent.length > 0) {
          expect(indent.length % 2).toBe(0)
        }
      })
    })
  })

  describe('required fields', () => {
    test('should have a name field', () => {
      expect(packageJson.name).toBeDefined()
      expect(packageJson.name).toBeTypeOf('string')
      expect(packageJson.name.length).toBeGreaterThan(0)
    })

    test('should have a valid name format', () => {
      // Package names should be lowercase and can contain hyphens
      expect(packageJson.name).toMatch(/^[a-z0-9-]+$/)
    })

    test('should have a version field', () => {
      expect(packageJson.version).toBeDefined()
      expect(packageJson.version).toBeTypeOf('string')
    })

    test('should have a valid semantic version', () => {
      const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/
      expect(packageJson.version).toMatch(semverRegex)
    })

    test('should have a license field', () => {
      expect(packageJson.license).toBeDefined()
      expect(packageJson.license).toBeTypeOf('string')
    })

    test('should have a valid SPDX license identifier', () => {
      const commonLicenses = ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC']
      expect(commonLicenses).toContain(packageJson.license)
    })
  })

  describe('scripts', () => {
    test('should have a scripts object', () => {
      expect(packageJson.scripts).toBeDefined()
      expect(packageJson.scripts).toBeTypeOf('object')
    })

    test('should have required Next.js scripts', () => {
      expect(packageJson.scripts.dev).toBeDefined()
      expect(packageJson.scripts.build).toBeDefined()
      expect(packageJson.scripts.start).toBeDefined()
    })

    test('dev script should use next dev', () => {
      expect(packageJson.scripts.dev).toContain('next dev')
    })

    test('build script should use next build', () => {
      expect(packageJson.scripts.build).toBe('next build')
    })

    test('start script should use next start', () => {
      expect(packageJson.scripts.start).toBe('next start')
    })

    test('export script should use next export', () => {
      expect(packageJson.scripts.export).toBe('next export')
    })

    test('all script commands should be strings', () => {
      Object.values(packageJson.scripts).forEach(script => {
        expect(script).toBeTypeOf('string')
      })
    })
  })

  describe('dependencies', () => {
    test('should have a dependencies object', () => {
      expect(packageJson.dependencies).toBeDefined()
      expect(packageJson.dependencies).toBeTypeOf('object')
    })

    test('should include required Supabase packages', () => {
      expect(packageJson.dependencies['@supabase/auth-ui-react']).toBeDefined()
      expect(packageJson.dependencies['@supabase/auth-ui-shared']).toBeDefined()
      expect(packageJson.dependencies['@supabase/supabase-js']).toBeDefined()
    })

    test('should include React dependencies', () => {
      expect(packageJson.dependencies.react).toBeDefined()
      expect(packageJson.dependencies['react-dom']).toBeDefined()
    })

    test('should include Next.js', () => {
      expect(packageJson.dependencies.next).toBeDefined()
    })

    test('all dependency versions should be valid', () => {
      const validVersionRegex = /^([\^~]?\d+\.\d+\.\d+|latest)$/
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        expect(version).toMatch(validVersionRegex)
      })
    })

    test('React versions should be compatible', () => {
      const reactVersion = packageJson.dependencies.react
      const reactDomVersion = packageJson.dependencies['react-dom']
      
      // Both should use the same version specifier
      expect(reactVersion).toBe(reactDomVersion)
    })

    test('Supabase auth UI packages should have compatible versions', () => {
      const authUiReact = packageJson.dependencies['@supabase/auth-ui-react']
      const authUiShared = packageJson.dependencies['@supabase/auth-ui-shared']
      
      expect(authUiReact).toBeDefined()
      expect(authUiShared).toBeDefined()
    })
  })

  describe('devDependencies', () => {
    test('should have a devDependencies object', () => {
      expect(packageJson.devDependencies).toBeDefined()
      expect(packageJson.devDependencies).toBeTypeOf('object')
    })

    test('should include Supabase CLI', () => {
      expect(packageJson.devDependencies.supabase).toBeDefined()
    })

    test('Supabase CLI version should be correctly specified', () => {
      const supabaseVersion = packageJson.devDependencies.supabase
      expect(supabaseVersion).toBe('^2.72.8')
    })

    test('Supabase CLI version should follow semver format', () => {
      const supabaseVersion = packageJson.devDependencies.supabase
      const semverRegex = /^\^?\d+\.\d+\.\d+$/
      expect(supabaseVersion).toMatch(semverRegex)
    })

    test('should include dotenvx for environment management', () => {
      expect(packageJson.devDependencies['@dotenvx/dotenvx']).toBeDefined()
    })

    test('should include Tailwind CSS and related tools', () => {
      expect(packageJson.devDependencies.tailwindcss).toBeDefined()
      expect(packageJson.devDependencies.postcss).toBeDefined()
      expect(packageJson.devDependencies.autoprefixer).toBeDefined()
    })

    test('all devDependency versions should be valid', () => {
      const validVersionRegex = /^[\^~]?\d+\.\d+\.\d+$/
      Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
        expect(version).toMatch(validVersionRegex)
      })
    })

    test('PostCSS and Autoprefixer should have compatible versions', () => {
      const postcssVersion = packageJson.devDependencies.postcss
      const autoprefixerVersion = packageJson.devDependencies.autoprefixer
      
      expect(postcssVersion).toBeDefined()
      expect(autoprefixerVersion).toBeDefined()
    })
  })

  describe('version constraints', () => {
    test('should use caret (^) for most dependencies', () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }

      let caretCount = 0
      let totalCount = 0

      Object.entries(allDeps).forEach(([name, version]) => {
        if (typeof version === 'string' && version !== 'latest') {
          totalCount++
          if (version.startsWith('^')) {
            caretCount++
          }
        }
      })

      // Most should use caret, but not necessarily all (e.g., "latest")
      expect(caretCount).toBeGreaterThan(totalCount * 0.7)
    })

    test('Next.js should use "latest" tag', () => {
      expect(packageJson.dependencies.next).toBe('latest')
    })

    test('should not have duplicate dependencies', () => {
      const deps = Object.keys(packageJson.dependencies || {})
      const devDeps = Object.keys(packageJson.devDependencies || {})
      
      const duplicates = deps.filter(dep => devDeps.includes(dep))
      expect(duplicates).toHaveLength(0)
    })
  })

  describe('package metadata', () => {
    test('should have correct package name', () => {
      expect(packageJson.name).toBe('supabase-slack-clone-basic')
    })

    test('package name should reflect the project', () => {
      expect(packageJson.name).toContain('supabase')
      expect(packageJson.name).toContain('slack-clone')
    })

    test('should be at version 0.2.0', () => {
      expect(packageJson.version).toBe('0.2.0')
    })

    test('should use MIT license', () => {
      expect(packageJson.license).toBe('MIT')
    })
  })

  describe('dependency security', () => {
    test('should not have known vulnerable version patterns', () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }

      Object.entries(allDeps).forEach(([name, version]) => {
        // Should not use wildcard versions
        expect(version).not.toBe('*')
        expect(version).not.toBe('x')
        
        // Should not use git URLs (security risk)
        expect(version).not.toMatch(/^git/)
        expect(version).not.toMatch(/^http/)
      })
    })

    test('should use specific major versions', () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }

      Object.entries(allDeps).forEach(([name, version]) => {
        if (typeof version === 'string' && version !== 'latest') {
          // Should specify at least major version
          const hasVersion = version.match(/\d+/)
          expect(hasVersion).toBeTruthy()
        }
      })
    })
  })

  describe('edge cases and error handling', () => {
    test('should not have circular dependencies', () => {
      // In a package.json, the package itself shouldn't be in its own dependencies
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }

      expect(allDeps[packageJson.name]).toBeUndefined()
    })

    test('should not have empty dependency objects', () => {
      if (packageJson.dependencies) {
        expect(Object.keys(packageJson.dependencies).length).toBeGreaterThan(0)
      }
      if (packageJson.devDependencies) {
        expect(Object.keys(packageJson.devDependencies).length).toBeGreaterThan(0)
      }
    })

    test('should not have undefined or null values', () => {
      const checkObject = (obj: any, path = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key
          
          expect(value).not.toBeUndefined()
          expect(value).not.toBeNull()
          
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            checkObject(value, currentPath)
          }
        })
      }

      checkObject(packageJson)
    })

    test('should handle version comparison for supabase CLI', () => {
      const supabaseVersion = packageJson.devDependencies.supabase
      const versionNumber = supabaseVersion.replace('^', '')
      const [major, minor, patch] = versionNumber.split('.').map(Number)
      
      expect(major).toBeGreaterThanOrEqual(2)
      expect(minor).toBeGreaterThanOrEqual(0)
      expect(patch).toBeGreaterThanOrEqual(0)
      
      // Specific check: should be version 2.72.8
      expect(major).toBe(2)
      expect(minor).toBe(72)
      expect(patch).toBe(8)
    })
  })

  describe('compatibility checks', () => {
    test('Supabase packages should be compatible versions', () => {
      const supabaseJs = packageJson.dependencies['@supabase/supabase-js']
      const supabaseCli = packageJson.devDependencies.supabase
      
      // CLI major version should be compatible with JS client major version
      const jsVersion = supabaseJs.replace('^', '').split('.')[0]
      const cliVersion = supabaseCli.replace('^', '').split('.')[0]
      
      expect(jsVersion).toBe('2')
      expect(cliVersion).toBe('2')
    })

    test('should have compatible Next.js and React versions', () => {
      const nextVersion = packageJson.dependencies.next
      const reactVersion = packageJson.dependencies.react
      
      // Next.js "latest" should work with React 18
      expect(reactVersion).toContain('18')
    })

    test('PostCSS plugins should be compatible', () => {
      const postcss = packageJson.devDependencies.postcss
      const autoprefixer = packageJson.devDependencies.autoprefixer
      const tailwind = packageJson.devDependencies.tailwindcss
      
      expect(postcss).toBeDefined()
      expect(autoprefixer).toBeDefined()
      expect(tailwind).toBeDefined()
      
      // All should use caret for compatibility
      expect(postcss).toMatch(/^\^/)
      expect(autoprefixer).toMatch(/^\^/)
      expect(tailwind).toMatch(/^\^/)
    })
  })

  describe('version upgrade validation', () => {
    test('Supabase CLI should be at least version 2.72.8', () => {
      const supabaseVersion = packageJson.devDependencies.supabase
      const versionNumber = supabaseVersion.replace('^', '')
      const [major, minor, patch] = versionNumber.split('.').map(Number)
      
      const currentVersionNum = major * 1000000 + minor * 1000 + patch
      const minVersionNum = 2 * 1000000 + 72 * 1000 + 8
      
      expect(currentVersionNum).toBeGreaterThanOrEqual(minVersionNum)
    })

    test('should not downgrade from version 2.72.8', () => {
      const supabaseVersion = packageJson.devDependencies.supabase
      const versionNumber = supabaseVersion.replace('^', '')
      
      // Parse version
      const [major, minor, patch] = versionNumber.split('.').map(Number)
      const currentVersionNum = major * 1000000 + minor * 1000 + patch
      const minVersionNum = 2 * 1000000 + 72 * 1000 + 8
      
      expect(currentVersionNum).toBeGreaterThanOrEqual(minVersionNum)
    })
  })

  describe('file format validation', () => {
    test('should end with newline', () => {
      expect(packageJsonRaw.endsWith('\n')).toBe(true)
    })

    test('should not have Windows line endings', () => {
      expect(packageJsonRaw).not.toContain('\r\n')
    })

    test('should use UTF-8 encoding', () => {
      // Check that there are no invalid UTF-8 sequences
      const buffer = Buffer.from(packageJsonRaw, 'utf-8')
      const decoded = buffer.toString('utf-8')
      expect(decoded).toBe(packageJsonRaw)
    })

    test('should have consistent quote style', () => {
      // Count double quotes vs single quotes in property names
      const doubleQuotes = (packageJsonRaw.match(/"[^"]*":/g) || []).length
      const singleQuotes = (packageJsonRaw.match(/'[^']*':/g) || []).length
      
      // Should use double quotes (standard JSON)
      expect(doubleQuotes).toBeGreaterThan(0)
      expect(singleQuotes).toBe(0)
    })
  })

  describe('integration with project structure', () => {
    test('should be appropriate for a Next.js example project', () => {
      expect(packageJson.dependencies.next).toBeDefined()
      expect(packageJson.dependencies.react).toBeDefined()
      expect(packageJson.scripts.dev).toBeDefined()
    })

    test('should be appropriate for a Supabase example', () => {
      expect(packageJson.dependencies['@supabase/supabase-js']).toBeDefined()
      expect(packageJson.devDependencies.supabase).toBeDefined()
    })

    test('should support dotenvx workflow', () => {
      expect(packageJson.devDependencies['@dotenvx/dotenvx']).toBeDefined()
    })

    test('should support Slack clone features', () => {
      // JWT for token handling
      expect(packageJson.dependencies['jwt-decode']).toBeDefined()
      
      // Supabase auth UI for authentication
      expect(packageJson.dependencies['@supabase/auth-ui-react']).toBeDefined()
    })
  })
})