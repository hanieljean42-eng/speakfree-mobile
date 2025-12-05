import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Loading, EmptyState } from '../components';
import { discussionService } from '../services';

export default function DiscussionScreen({ navigation, route }) {
  const { discussionCode, reportCode } = route.params;

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadMessages();
    connectWebSocket();

    return () => {
      discussionService.disconnect();
    };
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    const result = await discussionService.getMessages(discussionCode);

    if (result.success) {
      setMessages(result.messages.reverse());
    }
    setLoading(false);
  };

  const connectWebSocket = () => {
    try {
      discussionService.connect(discussionCode);
      setConnected(true);

      // Listen for new messages
      discussionService.onMessage((message) => {
        setMessages((prev) => [...prev, message]);
        setTimeout(() => scrollToBottom(), 100);
      });

      // Listen for typing indicators
      discussionService.onTyping((data) => {
        if (data.sender === 'SCHOOL') {
          setIsTyping(data.typing !== false);
        }
      });
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    }
  };

  const sendMessage = async () => {
    const content = inputMessage.trim();
    if (!content) return;

    setSending(true);
    setInputMessage('');

    try {
      if (connected) {
        // Send via WebSocket
        await discussionService.sendMessageViaSocket(
          discussionCode,
          content,
          'STUDENT'
        );
      } else {
        // Fallback to REST
        const result = await discussionService.sendMessage(
          discussionCode,
          content,
          'STUDENT'
        );

        if (result.success) {
          setMessages((prev) => [...prev, result.message]);
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setSending(false);
      discussionService.stopTyping(discussionCode, 'STUDENT');
    }
  };

  const handleInputChange = (text) => {
    setInputMessage(text);

    if (connected) {
      // Send typing indicator
      discussionService.sendTyping(discussionCode, 'STUDENT');

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        discussionService.stopTyping(discussionCode, 'STUDENT');
      }, 2000);
    }
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
      });
    }
  };

  const renderMessage = ({ item, index }) => {
    const isStudent = item.sender === 'STUDENT';
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = !previousMessage ||
      new Date(item.createdAt).toDateString() !== new Date(previousMessage.createdAt).toDateString();

    return (
      <>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{formatDate(item.createdAt)}</Text>
          </View>
        )}

        <View style={[styles.messageContainer, isStudent && styles.messageContainerStudent]}>
          <View style={[styles.messageBubble, isStudent && styles.messageBubbleStudent]}>
            <Text style={[styles.messageText, isStudent && styles.messageTextStudent]}>
              {item.content}
            </Text>
            <View style={styles.messageFooter}>
              <Text style={[styles.messageTime, isStudent && styles.messageTimeStudent]}>
                {formatTime(item.createdAt)}
              </Text>
              {isStudent && item.readAt && (
                <Ionicons
                  name="checkmark-done"
                  size={14}
                  color={COLORS.white}
                  style={styles.readIcon}
                />
              )}
            </View>
          </View>
        </View>
      </>
    );
  };

  if (loading) {
    return <Loading message="Chargement de la discussion..." fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Discussion anonyme</Text>
          <View style={styles.headerStatus}>
            <View style={[styles.statusDot, connected && styles.statusDotConnected]} />
            <Text style={styles.headerSubtitle}>
              {reportCode} • {connected ? 'Connecté' : 'Hors ligne'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages list */}
      {messages.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="Aucun message"
          message="Commencez la conversation avec votre établissement"
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />
      )}

      {/* Typing indicator */}
      {isTyping && (
        <View style={styles.typingIndicator}>
          <View style={styles.typingDot} />
          <View style={[styles.typingDot, styles.typingDot2]} />
          <View style={[styles.typingDot, styles.typingDot3]} />
          <Text style={styles.typingText}>L'établissement est en train d'écrire...</Text>
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={handleInputChange}
            placeholder="Écrivez votre message..."
            placeholderTextColor={COLORS.gray}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputMessage.trim() || sending}
          >
            {sending ? (
              <Ionicons name="hourglass-outline" size={24} color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={24} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SIZES.base / 2,
    marginRight: SIZES.padding,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    fontWeight: '600',
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
    marginRight: SIZES.base / 2,
  },
  statusDotConnected: {
    backgroundColor: COLORS.success,
  },
  headerSubtitle: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  messagesList: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: SIZES.padding,
  },
  dateSeparatorText: {
    ...FONTS.body4,
    color: COLORS.gray,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius / 2,
  },
  messageContainer: {
    marginBottom: SIZES.padding,
    alignItems: 'flex-start',
  },
  messageContainerStudent: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    maxWidth: '80%',
  },
  messageBubbleStudent: {
    backgroundColor: COLORS.primary,
  },
  messageText: {
    ...FONTS.body3,
    color: COLORS.black,
    lineHeight: 20,
  },
  messageTextStudent: {
    color: COLORS.white,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.base / 2,
  },
  messageTime: {
    ...FONTS.body4,
    color: COLORS.gray,
    fontSize: 11,
  },
  messageTimeStudent: {
    color: COLORS.white,
    opacity: 0.8,
  },
  readIcon: {
    marginLeft: 4,
    opacity: 0.8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
    marginRight: 4,
  },
  typingDot2: {
    animationDelay: '0.2s',
  },
  typingDot3: {
    animationDelay: '0.4s',
  },
  typingText: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginLeft: SIZES.base,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    ...FONTS.body3,
    color: COLORS.black,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    marginRight: SIZES.base,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
