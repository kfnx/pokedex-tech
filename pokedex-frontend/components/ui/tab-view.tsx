import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';

export interface Tab {
  key: string;
  title: string;
  content: React.ReactNode;
}

interface TabViewProps {
  tabs: Tab[];
  initialTab?: string;
}

export function TabView({ tabs, initialTab }: TabViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.key);
  const { width } = useWindowDimensions();

  const backgroundColor = '#000000';
  const textColor = '#FFFFFF';
  const borderColor = '#333333';
  const activeColor = '#0A84FF';

  const activeTabContent = tabs.find(tab => tab.key === activeTab)?.content;

  return (
    <View style={styles.container}>
      <View style={[styles.tabBar, { borderBottomColor: borderColor }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.tab,
                  {
                    borderBottomColor: isActive ? activeColor : 'transparent',
                    minWidth: width >= 768 ? 120 : 80,
                  }
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <ThemedText
                  style={[
                    styles.tabTitle,
                    {
                      color: isActive ? activeColor : textColor,
                      fontWeight: isActive ? '600' : '400',
                    }
                  ]}
                >
                  {tab.title}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.contentContainer}>
        {activeTabContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    borderBottomWidth: 1,
  },
  tabBarContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginRight: 8,
    borderBottomWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
});