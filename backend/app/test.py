def get_formatted_input(messages, context):
    instruction = "Please summarize the following paragraph:"
    system = "System: " + instruction
    messages = [
        {"role": "user", "content": messages},
    ]

    print("Messages:")
    print(messages)

    for item in messages:
        if item["role"] == "user":
            # only apply this instruction for the first user turn
            item["content"] = instruction + " " + item["content"]
            break

    conversation = (
        "\n\n".join(
            [
                (
                                        "User: " + item["content"]
                    if item["role"] == "user"
                    else "Assistant: " + item["content"]
                )
                for item in messages
            ]
        )
        + "\n\nAssistant:"
    )
    formatted_input = system + "\n\n" + context + "\n\n" + conversation

    return formatted_input







