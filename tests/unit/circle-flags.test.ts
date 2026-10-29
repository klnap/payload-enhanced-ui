import { describe, expect, test } from 'bun:test'

import {
  circleFlagUrl,
  resolveCircleFlagCode,
} from '../../src/components/locale-switcher/circle-flags'

describe('circle-flags', () => {
  test('maps language locales to country flags', () => {
    expect(resolveCircleFlagCode('pl')).toBe('pl')
    expect(resolveCircleFlagCode('en')).toBe('gb')
    expect(resolveCircleFlagCode('de')).toBe('de')
  })

  test('uses region suffix when present', () => {
    expect(resolveCircleFlagCode('en-US')).toBe('us')
    expect(resolveCircleFlagCode('en-GB')).toBe('gb')
  })

  test('honours flagCodeByLocale overrides', () => {
    expect(resolveCircleFlagCode('en', { en: 'us' })).toBe('us')
  })

  test('builds hatscripts URL', () => {
    expect(
      circleFlagUrl('pl', {
        baseUrl: 'https://hatscripts.github.io/circle-flags',
        flagCodeByLocale: {},
      })
    ).toBe('https://hatscripts.github.io/circle-flags/flags/pl.svg')
  })
})
