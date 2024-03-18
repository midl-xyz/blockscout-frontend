import {
  Box, Flex, Heading, IconButton, Image, Link, List, Modal, ModalBody,
  ModalCloseButton, ModalContent, ModalFooter, ModalOverlay, Tag, Text, useColorModeValue,
} from '@chakra-ui/react';
import React, { useCallback } from 'react';

import type { MarketplaceAppWithSecurityReport } from 'types/client/marketplace';
import { ContractListTypes } from 'types/client/marketplace';

import useIsMobile from 'lib/hooks/useIsMobile';
import { nbsp } from 'lib/html-entities';
import type { IconName } from 'ui/shared/IconSvg';
import IconSvg from 'ui/shared/IconSvg';

import AppSecurityReport from './AppSecurityReport';
import ContractListButton, { ContractListButtonVariants } from './ContractListButton';
import MarketplaceAppModalLink from './MarketplaceAppModalLink';

type Props = {
  onClose: () => void;
  isFavorite: boolean;
  onFavoriteClick: (id: string, isFavorite: boolean) => void;
  data: MarketplaceAppWithSecurityReport;
  showContractList: (id: string, type: ContractListTypes) => void;
}

const MarketplaceAppModal = ({
  onClose,
  isFavorite,
  onFavoriteClick,
  data,
  showContractList: showContractListDefault,
}: Props) => {
  const {
    id,
    title,
    url,
    external,
    author,
    description,
    site,
    github,
    telegram,
    twitter,
    logo,
    logoDarkMode,
    categories,
    securityReport,
  } = data;

  const socialLinks = [
    telegram ? {
      icon: 'social/telega' as IconName,
      url: telegram,
    } : null,
    twitter ? {
      icon: 'social/tweet' as IconName,
      url: twitter,
    } : null,
  ].filter(Boolean);

  if (github) {
    if (Array.isArray(github)) {
      github.forEach((url) => socialLinks.push({ icon: 'social/git', url }));
    } else {
      socialLinks.push({ icon: 'social/git', url: github });
    }
  }

  const handleFavoriteClick = useCallback(() => {
    onFavoriteClick(id, isFavorite);
  }, [ onFavoriteClick, id, isFavorite ]);

  const showContractList = useCallback((type: ContractListTypes) => {
    onClose();
    showContractListDefault(id, type);
  }, [ onClose, showContractListDefault, id ]);

  const showAllContracts = React.useCallback(() => {
    showContractList(ContractListTypes.ALL);
  }, [ showContractList ]);

  const showVerifiedContracts = React.useCallback(() => {
    showContractList(ContractListTypes.VERIFIED);
  }, [ showContractList ]);

  const showAnalyzedContracts = React.useCallback(() => {
    showContractList(ContractListTypes.ANALYZED);
  }, [ showContractList ]);

  const isMobile = useIsMobile();
  const logoUrl = useColorModeValue(logo, logoDarkMode || logo);

  return (
    <Modal
      isOpen={ Boolean(data.id) }
      onClose={ onClose }
      size={ isMobile ? 'full' : 'md' }
      isCentered
    >
      <ModalOverlay/>

      <ModalContent>
        <Box
          display="grid"
          gridTemplateColumns={{ base: 'auto 1fr' }}
          paddingRight={{ sm: 12 }}
          marginBottom={{ base: 6, sm: 8 }}
        >
          <Flex
            alignItems="center"
            justifyContent="center"
            w={{ base: '72px', sm: '144px' }}
            h={{ base: '72px', sm: '144px' }}
            marginRight={{ base: 6, sm: 8 }}
            gridRow={{ base: '1 / 3', sm: '1 / 4' }}
          >
            <Image
              src={ logoUrl }
              alt={ `${ title } app icon` }
            />
          </Flex>

          <Heading
            as="h2"
            gridColumn={ 2 }
            fontSize={{ base: '2xl', sm: '3xl' }}
            fontWeight="medium"
            lineHeight={ 1 }
            color="blue.600"
          >
            { title }
          </Heading>

          <Text
            variant="secondary"
            gridColumn={ 2 }
            fontSize="sm"
            fontWeight="normal"
            lineHeight={ 1 }
          >
            By{ nbsp }{ author }
          </Text>

          <Box
            gridColumn={{ base: '1 / 3', sm: 2 }}
            marginTop={{ base: 6, sm: 0 }}
          >
            <Flex flexWrap="wrap" gap={ 6 }>
              <Flex width={{ base: '100%', sm: 'auto' }}>
                <MarketplaceAppModalLink
                  id={ data.id }
                  url={ url }
                  external={ external }
                  title={ title }
                />

                <IconButton
                  aria-label="Mark as favorite"
                  title="Mark as favorite"
                  variant="outline"
                  colorScheme="gray"
                  w={ 9 }
                  h={ 8 }
                  onClick={ handleFavoriteClick }
                  icon={ isFavorite ?
                    <IconSvg name="star_filled" w={ 5 } h={ 5 } color="yellow.400"/> :
                    <IconSvg name="star_outline" w={ 5 } h={ 5 } color="gray.600"/> }
                />
              </Flex>

              { securityReport && (
                <Flex alignItems="center" gap={ 3 }>
                  <AppSecurityReport securityReport={ securityReport } showContractList={ showAnalyzedContracts }/>
                  <ContractListButton
                    onClick={ showAllContracts }
                    variant={ ContractListButtonVariants.ALL_CONTRACTS }
                  >
                    { securityReport.overallInfo.totalContractsNumber }
                  </ContractListButton>
                  <ContractListButton
                    onClick={ showVerifiedContracts }
                    variant={ ContractListButtonVariants.VERIFIED_CONTRACTS }
                  >
                    { securityReport.overallInfo.verifiedNumber }
                  </ContractListButton>
                </Flex>
              ) }
            </Flex>
          </Box>
        </Box>

        <ModalCloseButton/>

        <ModalBody>
          <Heading
            as="h3"
            fontSize="2xl"
            marginBottom={ 4 }
          >
            Overview
          </Heading>

          <Box marginBottom={ 2 }>
            { categories.map((category) => (
              <Tag
                colorScheme="blue"
                marginRight={ 2 }
                marginBottom={ 2 }
                key={ category }
              >
                { category }
              </Tag>
            )) }
          </Box>

          <Text>{ description }</Text>
        </ModalBody>

        <ModalFooter
          display="flex"
          flexDirection={{ base: 'column', sm: 'row' }}
          alignItems={{ base: 'flex-start', sm: 'center' }}
        >
          { site && (
            <Link
              isExternal
              href={ site }
              display="flex"
              alignItems="center"
              paddingRight={{ sm: 2 }}
              marginBottom={{ base: 3, sm: 0 }}
              maxW="100%"
              overflow="hidden"
            >
              <IconSvg
                name="link"
                display="inline"
                verticalAlign="baseline"
                boxSize="18px"
                marginRight={ 2 }
              />

              <Text
                color="inherit"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                { site }
              </Text>
            </Link>
          ) }

          { socialLinks.length > 0 && (
            <List
              marginLeft={{ sm: 'auto' }}
              display="grid"
              gridAutoFlow="column"
              columnGap={ 2 }
            >
              { socialLinks.map(({ icon, url }) => (
                <Link
                  aria-label={ `Link to ${ url }` }
                  title={ url }
                  key={ url }
                  href={ url }
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  isExternal
                  w={ 10 }
                  h={ 10 }
                >
                  <IconSvg
                    name={ icon }
                    w="20px"
                    h="20px"
                    display="block"
                  />
                </Link>
              )) }
            </List>
          ) }
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MarketplaceAppModal;
