package com.serendipity.global.security;

import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String phone) throws UsernameNotFoundException {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + phone));

        return UserPrincipal.builder()
                .id(user.getId())
                .phone(user.getPhone())
                .password(user.getPasswordHash())
                .role(user.getRole())
                .build();
    }
}
