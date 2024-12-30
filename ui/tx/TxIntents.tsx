/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-no-bind */
// eslint-disable-next-line no-restricted-imports
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import {
  Box,
  Text,
  HStack,
  Collapse,
  List,
  ListItem,
  Link,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import type React from 'react';
import { useState } from 'react';

import type { Transaction } from 'types/api/transaction';

interface IntentsDropdownProps {
  data: Transaction | undefined | null;
  isLoading: boolean;
}

const IntentsDropdown: React.FC<IntentsDropdownProps> = ({
  data,
  isLoading,
}) => {
  const [ isOpen, setIsOpen ] = useState(false);


  const toggleDropdown = () => setIsOpen(!isOpen);

  const intents = data?.intents || [];
  const intentsCount = intents.length;
  const pendingCount = intents.filter(
    (intent) => intent.status === undefined,
  ).length;

  return (
    <Box>
      <HStack spacing={ 2 } cursor="pointer" onClick={ toggleDropdown }>
        <Text
          color={ useColorModeValue('blue.600', 'blue.300') }
          fontWeight="normal"
        >
          Show { intentsCount } Transactions
        </Text>
        <Icon as={ isOpen ? ChevronUpIcon : ChevronDownIcon }/>
        <Text color="gray.500" fontSize="sm">
          | { pendingCount } pending
        </Text>
      </HStack>

      <Collapse in={ isOpen } animateOpacity>
        <Box mt={ 2 } pl={ 4 } borderLeft="1px solid" borderColor="gray.300">
          { isLoading ? (
            <Text>Loading...</Text>
          ) : intentsCount > 0 ? (
            <List spacing={ 2 }>
              { intents.map((intent, index) => (
                <ListItem
                  key={ index }
                  sx={{ flexDirection: 'row', display: 'flex', gap: 1 }}
                >
                  <p>{ intent.method } -</p>
                  <Link href={ `/tx/${ intent.hash }` } color="blue.500" isExternal>
                    { intent.hash }{ ' ' }
                  </Link>
                </ListItem>
              )) }
            </List>
          ) : (
            <Text>No intents available</Text>
          ) }
        </Box>
      </Collapse>
    </Box>
  );
};

export default IntentsDropdown;
