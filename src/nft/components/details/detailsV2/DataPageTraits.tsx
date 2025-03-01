import { Trans } from '@lingui/macro'
import Column from 'components/Column'
import { ScrollBarStyles } from 'components/Common'
import Row from 'components/Row'
import { useSubscribeScrollState } from 'nft/hooks'
import { GenieAsset } from 'nft/types'
import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { opacify } from 'theme/utils'

import { Tab, TabbedComponent } from './TabbedComponent'
import { TraitRow } from './TraitRow'

const TraitsHeaderContainer = styled(Row)`
  padding-right: 12px;
`

const TraitsHeader = styled(ThemedText.SubHeaderSmall)<{ $flex?: number; $justifyContent?: string }>`
  display: flex;
  line-height: 20px;
  color: ${({ theme }) => theme.textSecondary};
  flex: ${({ $flex }) => $flex ?? 1};
  justify-content: ${({ $justifyContent }) => $justifyContent};
`

const TraitRowContainer = styled.div`
  position: relative;
`

const TraitRowScrollableContainer = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 412px;
  width: calc(100% + 6px);

  ${ScrollBarStyles}
`

// Scrim that fades out the top and bottom of the scrollable container, isBottom changes the direction and placement of the fade
const Scrim = styled.div<{ isBottom?: boolean }>`
  position: absolute;
  height: 88px;
  left: 0px;
  right: 6px;

  ${({ isBottom }) =>
    isBottom
      ? 'bottom: 0px'
      : `
        top: 0px;
        transform: matrix(1, 0, 0, -1, 0, 0);
      `};

  background: ${({ theme }) =>
    `linear-gradient(180deg, ${opacify(0, theme.backgroundSurface)} 0%, ${theme.backgroundSurface} 100%)`};
  display: flex;
`

const TraitsContent = ({ asset }: { asset: GenieAsset }) => {
  const { userCanScroll, scrollRef, scrollProgress, scrollHandler } = useSubscribeScrollState()

  // This is needed to prevent rerenders when handling scrolls
  const traitRows = useMemo(() => {
    return asset.traits?.map((trait) => (
      <TraitRow collectionAddress={asset.address} trait={trait} key={trait.trait_type + ':' + trait.trait_value} />
    ))
  }, [asset.address, asset.traits])

  return (
    <Column>
      <TraitsHeaderContainer>
        <TraitsHeader $flex={3}>
          <Trans>Trait</Trans>
        </TraitsHeader>
        <TraitsHeader $flex={2}>
          <Trans>Floor price</Trans>
        </TraitsHeader>
        <TraitsHeader>
          <Trans>Quantity</Trans>
        </TraitsHeader>
        <TraitsHeader $flex={1.5} $justifyContent="flex-end">
          <Trans>Rarity</Trans>
        </TraitsHeader>
      </TraitsHeaderContainer>
      <TraitRowContainer>
        {scrollProgress > 0 && <Scrim />}
        <TraitRowScrollableContainer ref={scrollRef} onScroll={scrollHandler}>
          {traitRows}
        </TraitRowScrollableContainer>
        {userCanScroll && scrollProgress !== 100 && <Scrim isBottom={true} />}
      </TraitRowContainer>
    </Column>
  )
}

enum TraitTabsKeys {
  Traits = 'traits',
}

export const DataPageTraits = ({ asset }: { asset: GenieAsset }) => {
  const TraitTabs: Map<string, Tab> = useMemo(
    () =>
      new Map([
        [
          TraitTabsKeys.Traits,
          {
            title: <Trans>Traits</Trans>,
            key: TraitTabsKeys.Traits,
            content: <TraitsContent asset={asset} />,
            count: asset.traits?.length,
          },
        ],
      ]),
    [asset]
  )
  return <TabbedComponent tabs={TraitTabs} />
}
